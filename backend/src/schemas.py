from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    is_active: bool

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

    class Config:
        from_attributes = True
