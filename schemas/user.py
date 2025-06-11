# schemas/user.py

from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: UUID
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str
        }


class TokenRead(BaseModel):
    id: UUID
    user_id: UUID
    token: str
    created_at: datetime
    expires_at: Optional[datetime]
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str