# schemas/user.py

from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime
from schemas.base import BaseSchema
from utils.password_validator import validate_password, get_password_requirements


class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        is_valid, errors = validate_password(v)
        if not is_valid:
            error_message = "Password validation failed:\n" + "\n".join(f"• {error}" for error in errors)
            raise ValueError(error_message)
        return v


class UserUpdate(UserBase):
    password: str | None = None
    
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        is_valid, errors = validate_password(v)
        if not is_valid:
            error_message = "Password validation failed:\n" + "\n".join(f"• {error}" for error in errors)
            raise ValueError(error_message)
        return v


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