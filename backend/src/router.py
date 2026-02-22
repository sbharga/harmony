from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, joinedload
import os
import shutil
import json
import mimetypes

from google import genai as google_genai
from google.genai import types as genai_types
import anthropic

from src import schemas
from src import models
from src.database import engine
from src.dependencies import get_db, get_current_user, get_user
from src.security import verify_password, get_password_hash
from src.prompts.environment_prompt import ENVIRONMENT_PROMPT
from src.prompts.layout_schema import LAYOUT_SCHEMA
from src.prompts.threejs_environment_prompt import THREEJS_ENVIRONMENT_PROMPT
from src.prompts.threejs_html_template import render_html
from src.harmony import compute_harmony, optimize_layout, build_heatmap

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
    designs = db.query(models.Design).options(joinedload(models.Design.files)).filter(models.Design.owner_id == current_user.id).offset(skip).limit(limit).all()
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

    # Locate uploaded images
    file_6ft = db.query(models.DesignFile).filter(
        models.DesignFile.design_id == design_id,
        models.DesignFile.file_type == "image_6ft"
    ).first()
    file_1ft = db.query(models.DesignFile).filter(
        models.DesignFile.design_id == design_id,
        models.DesignFile.file_type == "image_1ft"
    ).first()
    if not file_6ft or not file_1ft:
        raise HTTPException(status_code=400, detail="Stage 1 images not uploaded yet")

    # Strip /api/ prefix to get disk paths
    path_6ft = file_6ft.file_path.removeprefix("/api/")
    path_1ft = file_1ft.file_path.removeprefix("/api/")

    try:
        with open(path_6ft, "rb") as f:
            img_6ft_bytes = f.read()
        with open(path_1ft, "rb") as f:
            img_1ft_bytes = f.read()
    except OSError as e:
        raise HTTPException(status_code=500, detail=f"Could not read image files: {e}")

    def _mime(path):
        mt, _ = mimetypes.guess_type(path)
        return mt or "image/jpeg"

    img_6ft_part = genai_types.Part.from_bytes(data=img_6ft_bytes, mime_type=_mime(path_6ft))
    img_1ft_part = genai_types.Part.from_bytes(data=img_1ft_bytes, mime_type=_mime(path_1ft))

    # Call Gemini
    try:
        client_gemini = google_genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        response = client_gemini.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            contents=[ENVIRONMENT_PROMPT, img_6ft_part, img_1ft_part],
            config=genai_types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=LAYOUT_SCHEMA,
            ),
        )
        raw_layout = json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini API error: {e}")

    upload_dir = f"uploads/{design_id}"
    os.makedirs(upload_dir, exist_ok=True)

    # Save raw layout
    raw_path = f"{upload_dir}/layout_raw.json"
    with open(raw_path, "w") as f:
        json.dump(raw_layout, f, indent=2)
    save_design_file(db, design_id, "layout_raw", f"/api/{raw_path}")

    # Transform for Stage 2 display
    room = raw_layout.get("room") or {}
    frontend_json = {
        "room_dimensions": {
            "width":  room.get("w", 0),
            "length": room.get("d", 0),
            "height": room.get("h", 0),
        },
        "objects": [
            {
                "name": f'{o["type"]} {o.get("variant","")}'.strip(),
                "label": o["type"],
                "position": {"x": o["pos"]["x"], "y": 0, "z": o["pos"]["z"]},
                "confidence": o.get("confidence", 1.0),
            }
            for o in raw_layout.get("objects", [])
        ],
    }

    json_path = f"{upload_dir}/results.json"
    with open(json_path, "w") as f:
        json.dump(frontend_json, f, indent=2)
    save_design_file(db, design_id, "results_json", f"/api/{json_path}")

    db.refresh(design)
    return design

@api_router.post("/designs/{design_id}/generate_3d", response_model=schemas.Design)
async def generate_3d(design_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    design = db.query(models.Design).filter(models.Design.id == design_id, models.Design.owner_id == current_user.id).first()
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")

    # Load raw layout produced by Stage 2
    raw_file = db.query(models.DesignFile).filter(
        models.DesignFile.design_id == design_id,
        models.DesignFile.file_type == "layout_raw"
    ).first()
    if not raw_file:
        raise HTTPException(status_code=400, detail="Raw layout not found — run generate_json first")

    raw_path = raw_file.file_path.removeprefix("/api/")
    try:
        with open(raw_path) as f:
            raw_layout = json.load(f)
    except OSError as e:
        raise HTTPException(status_code=500, detail=f"Could not read layout file: {e}")

    # Call Claude to validate / normalise the layout
    try:
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        message = client.messages.create(
            model=os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6"),
            max_tokens=int(os.getenv("ANTHROPIC_MAX_TOKENS", "4096")),
            messages=[
                {
                    "role": "user",
                    "content": THREEJS_ENVIRONMENT_PROMPT + "\n\nInput JSON:\n" + json.dumps(raw_layout),
                }
            ],
        )
        response_text = message.content[0].text.strip()
        # Strip markdown fences if present
        if response_text.startswith("```"):
            response_text = response_text.split("```", 2)[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
            response_text = response_text.rsplit("```", 1)[0]
        spec = json.loads(response_text.strip())
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {e}")

    upload_dir = f"uploads/{design_id}"
    os.makedirs(upload_dir, exist_ok=True)

    spec_path = f"{upload_dir}/spec.json"
    with open(spec_path, "w") as f:
        json.dump(spec, f, indent=2)
    save_design_file(db, design_id, "spec_json", f"/api/{spec_path}")

    html_content = render_html(spec)
    html_path = f"{upload_dir}/render_3d.html"
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

    # Prefer Claude-refined spec, fall back to raw layout
    spec_file = db.query(models.DesignFile).filter(
        models.DesignFile.design_id == design_id,
        models.DesignFile.file_type == "spec_json"
    ).first()
    if not spec_file:
        spec_file = db.query(models.DesignFile).filter(
            models.DesignFile.design_id == design_id,
            models.DesignFile.file_type == "layout_raw"
        ).first()
    if not spec_file:
        raise HTTPException(status_code=400, detail="No layout spec found — run earlier stages first")

    spec_path = spec_file.file_path.removeprefix("/api/")
    try:
        with open(spec_path) as f:
            spec = json.load(f)
    except OSError as e:
        raise HTTPException(status_code=500, detail=f"Could not read spec file: {e}")

    optimized_spec, score = optimize_layout(spec)
    heatmap = build_heatmap(optimized_spec)

    html_content = render_html(optimized_spec, harmony_score=score, heatmap=heatmap)
    html_path = f"{upload_dir}/reorganized_3d.html"
    with open(html_path, "w") as f:
        f.write(html_content)
    save_design_file(db, design_id, "reorganized_3d", f"/api/{html_path}")

    db.refresh(design)
    return design
