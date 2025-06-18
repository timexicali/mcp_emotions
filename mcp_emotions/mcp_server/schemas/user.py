# schemas/user.py

from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime
from schemas.base import BaseSchema


class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str


class UserUpdate(UserBase):
    password: str | None = None


class UserInDB(UserBase, BaseSchema):
    pass


class User(UserInDB):
    id: UUID
    role_id: int
    created_at: datetime
    is_active: bool
    hashed_password: str

    model_config = ConfigDict(from_attributes=True)


class UserRead(UserBase):
    id: UUID
    role_id: int
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


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str