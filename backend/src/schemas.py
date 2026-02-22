from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str

    class Config:
        from_attributes = True

class DesignFileBase(BaseModel):
    file_type: str
    file_path: str

class DesignFileCreate(DesignFileBase):
    pass

class DesignFile(DesignFileBase):
    id: str
    design_id: str
    
    class Config:
        from_attributes = True

class DesignBase(BaseModel):
    name: str
    description: Optional[str] = None

class DesignCreate(DesignBase):
    pass

class Design(DesignBase):
    id: str
    owner_id: str
    files: list[DesignFile] = []

    class Config:
        from_attributes = True
