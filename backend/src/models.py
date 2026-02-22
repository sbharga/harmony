import uuid
from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from src.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    designs = relationship("Design", back_populates="owner")

class Design(Base):
    __tablename__ = "designs"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, index=True)
    description = Column(String)
    owner_id = Column(String, ForeignKey("users.id"))

    owner = relationship("User", back_populates="designs")
    files = relationship("DesignFile", back_populates="design", cascade="all, delete-orphan")

class DesignFile(Base):
    __tablename__ = "design_files"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    design_id = Column(String, ForeignKey("designs.id"))
    file_type = Column(String, index=True) # e.g. "image_6ft", "image_1ft", "results_json", "render_3d", "reorganized_3d"
    file_path = Column(String)
    
    design = relationship("Design", back_populates="files")
