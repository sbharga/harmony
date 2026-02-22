from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import os
import shutil
import json

from src import schemas
from src import models
from src.database import engine
from src.dependencies import get_db, get_current_user, get_user
from src.security import verify_password, get_password_hash

# Create the database tables
models.Base.metadata.create_all(bind=engine)

api_router = APIRouter(prefix="/api")

@api_router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = get_user(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@api_router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user(db, username=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"access_token": user.username, "token_type": "bearer"}

@api_router.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@api_router.get("/designs", response_model=list[schemas.Design])
def read_designs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    designs = db.query(models.Design).filter(models.Design.owner_id == current_user.id).offset(skip).limit(limit).all()
    return designs

@api_router.post("/designs", response_model=schemas.Design)
def create_design(design: schemas.DesignCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_design = models.Design(**design.model_dump(), owner_id=current_user.id)
    db.add(db_design)
    db.commit()
    db.refresh(db_design)
    return db_design

@api_router.get("/designs/{design_id}", response_model=schemas.Design)
def read_design(design_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    design = db.query(models.Design).filter(models.Design.id == design_id, models.Design.owner_id == current_user.id).first()
    if design is None:
        raise HTTPException(status_code=404, detail="Design not found")
    return design

@api_router.put("/designs/{design_id}", response_model=schemas.Design)
def update_design(design_id: str, design: schemas.DesignCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_design = db.query(models.Design).filter(models.Design.id == design_id, models.Design.owner_id == current_user.id).first()
    if db_design is None:
        raise HTTPException(status_code=404, detail="Design not found")
    
    for key, value in design.model_dump().items():
        setattr(db_design, key, value)
    
    db.commit()
    db.refresh(db_design)
    return db_design

@api_router.delete("/designs/{design_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_design(design_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_design = db.query(models.Design).filter(models.Design.id == design_id, models.Design.owner_id == current_user.id).first()
    if db_design is None:
        raise HTTPException(status_code=404, detail="Design not found")
    
    upload_dir = f"uploads/{design_id}"
    if os.path.exists(upload_dir):
        shutil.rmtree(upload_dir)

    db.delete(db_design)
    db.commit()
    return None

def save_design_file(db: Session, design_id: str, file_type: str, file_path: str):
    # Check if a file of this type already exists for this design, and update or create
    existing = db.query(models.DesignFile).filter(
        models.DesignFile.design_id == design_id,
        models.DesignFile.file_type == file_type
    ).first()
    
    if existing:
        existing.file_path = file_path
    else:
        new_file = models.DesignFile(
            design_id=design_id,
            file_type=file_type,
            file_path=file_path
        )
        db.add(new_file)
    db.commit()

@api_router.post("/designs/{design_id}/upload_stage_1", response_model=schemas.Design)
async def upload_stage_1(
    design_id: str,
    image_6ft: UploadFile = File(...),
    image_1ft: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    design = db.query(models.Design).filter(models.Design.id == design_id, models.Design.owner_id == current_user.id).first()
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
        
    upload_dir = f"uploads/{design_id}"
    os.makedirs(upload_dir, exist_ok=True)
    
    path_6ft = f"{upload_dir}/6ft_{image_6ft.filename}"
    path_1ft = f"{upload_dir}/1ft_{image_1ft.filename}"
    
    with open(path_6ft, "wb") as buffer:
        shutil.copyfileobj(image_6ft.file, buffer)
    with open(path_1ft, "wb") as buffer:
        shutil.copyfileobj(image_1ft.file, buffer)
        
    save_design_file(db, design_id, "image_6ft", f"/api/{path_6ft}")
    save_design_file(db, design_id, "image_1ft", f"/api/{path_1ft}")
    
    db.refresh(design)
    return design

@api_router.post("/designs/{design_id}/generate_json", response_model=schemas.Design)
async def generate_json(design_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    design = db.query(models.Design).filter(models.Design.id == design_id, models.Design.owner_id == current_user.id).first()
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
        
    upload_dir = f"uploads/{design_id}"
    os.makedirs(upload_dir, exist_ok=True)
    
    json_path = f"{upload_dir}/results.json"
    dummy_data = {
        "objects": [
            {"id": 1, "name": "sofa", "x": 2.5, "y": 0, "z": 1.5, "confidence": 0.95},
            {"id": 2, "name": "coffee table", "x": 2.5, "y": 0, "z": 3.0, "confidence": 0.88},
            {"id": 3, "name": "tv stand", "x": 2.5, "y": 0, "z": 5.0, "confidence": 0.91},
            {"id": 4, "name": "potted plant", "x": 0.5, "y": 0, "z": 0.5, "confidence": 0.76}
        ],
        "room_dimensions": {"width": 5.0, "length": 6.0, "height": 3.0}
    }
    
    with open(json_path, "w") as f:
        json.dump(dummy_data, f, indent=4)
        
    save_design_file(db, design_id, "results_json", f"/api/{json_path}")
    
    db.refresh(design)
    return design

@api_router.post("/designs/{design_id}/generate_3d", response_model=schemas.Design)
async def generate_3d(design_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    design = db.query(models.Design).filter(models.Design.id == design_id, models.Design.owner_id == current_user.id).first()
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
        
    upload_dir = f"uploads/{design_id}"
    os.makedirs(upload_dir, exist_ok=True)
    
    html_path = f"{upload_dir}/render_3d.html"
    
    html_content = """<!DOCTYPE html>
<html>
<head>
    <style>body { margin: 0; overflow: hidden; background: #000; color: #0f0; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; text-align: center; }</style>
</head>
<body>
    <h1>LOADING 3D ENGINE...</h1>
    <p>INITIAL RENDERING COMPLETE</p>
    <div style="width: 200px; height: 200px; border: 4px solid #0f0; margin-top: 20px; animation: spin 4s linear infinite;"></div>
    <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
</body>
</html>"""

    with open(html_path, "w") as f:
        f.write(html_content)
        
    save_design_file(db, design_id, "render_3d", f"/api/{html_path}")
    db.refresh(design)
    return design

@api_router.post("/designs/{design_id}/generate_reorganized", response_model=schemas.Design)
async def generate_reorganized(design_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    design = db.query(models.Design).filter(models.Design.id == design_id, models.Design.owner_id == current_user.id).first()
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
        
    upload_dir = f"uploads/{design_id}"
    os.makedirs(upload_dir, exist_ok=True)
    
    html_path = f"{upload_dir}/reorganized_3d.html"
    
    html_content = """<!DOCTYPE html>
<html>
<head>
    <style>body { margin: 0; overflow: hidden; background: #fff; color: #000; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; text-align: center; border: 16px solid #000; box-sizing: border-box; }</style>
</head>
<body>
    <h1 style="font-size: 3rem; font-weight: 900; text-transform: uppercase;">REORGANIZED</h1>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; width: 300px; height: 300px; border: 8px solid #000; padding: 10px;">
        <div style="background: #000;"></div>
        <div style="border: 4px solid #000;"></div>
        <div style="border: 4px solid #000;"></div>
        <div style="background: #000;"></div>
    </div>
</body>
</html>"""

    with open(html_path, "w") as f:
        f.write(html_content)
        
    save_design_file(db, design_id, "reorganized_3d", f"/api/{html_path}")
    db.refresh(design)
    return design
