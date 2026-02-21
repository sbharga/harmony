from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from src import schemas
from src import models
from src.database import engine
from src.dependencies import get_db, get_current_active_user, get_user
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
async def read_users_me(current_user: models.User = Depends(get_current_active_user)):
    return current_user

@api_router.get("/designs", response_model=list[schemas.Design])
def read_designs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    designs = db.query(models.Design).filter(models.Design.owner_id == current_user.id).offset(skip).limit(limit).all()
    return designs

@api_router.post("/designs", response_model=schemas.Design)
def create_design(design: schemas.DesignCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    db_design = models.Design(**design.model_dump(), owner_id=current_user.id)
    db.add(db_design)
    db.commit()
    db.refresh(db_design)
    return db_design

@api_router.get("/designs/{design_id}", response_model=schemas.Design)
def read_design(design_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    design = db.query(models.Design).filter(models.Design.id == design_id, models.Design.owner_id == current_user.id).first()
    if design is None:
        raise HTTPException(status_code=404, detail="Design not found")
    return design

@api_router.put("/designs/{design_id}", response_model=schemas.Design)
def update_design(design_id: str, design: schemas.DesignCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    db_design = db.query(models.Design).filter(models.Design.id == design_id, models.Design.owner_id == current_user.id).first()
    if db_design is None:
        raise HTTPException(status_code=404, detail="Design not found")
    
    for key, value in design.model_dump().items():
        setattr(db_design, key, value)
    
    db.commit()
    db.refresh(db_design)
    return db_design
