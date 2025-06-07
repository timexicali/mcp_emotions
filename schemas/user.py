# schemas/user.py

from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    password: str


class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    name: Optional[str] = None
    created_at: datetime
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class TokenRead(BaseModel):
    id: UUID
    user_id: UUID
    token: str
    created_at: datetime
    expires_at: Optional[datetime]
    is_active: bool

    model_config = ConfigDict(from_attributes=True)