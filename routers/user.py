from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from schemas.user import UserCreate, UserRead, UserLogin, Token
from crud.user import create_user, get_user_by_email, authenticate_user
from utils.jwt import create_access_token, get_current_user
from utils.logger import jwt_logger
from datetime import timedelta

router = APIRouter()

@router.post("/register", response_model=UserRead)
async def register_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    jwt_logger.info(f"Attempting to register user with email: {user.email}")
    existing_user = await get_user_by_email(db, user.email)
    if existing_user:
        jwt_logger.warning(f"Registration failed: Email {user.email} already registered")
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = await create_user(db, user)
    jwt_logger.info(f"Successfully registered user with email: {user.email}")
    return new_user

@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    jwt_logger.info(f"Login attempt for user: {form_data.username}")
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        jwt_logger.warning(f"Login failed for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": str(user.id)}
    )
    jwt_logger.info(f"Login successful for user: {form_data.username}")
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserRead)
async def read_users_me(
    current_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    jwt_logger.info(f"Fetching user profile for user ID: {current_user_id}")
    user = await get_user_by_email(db, current_user_id)
    if not user:
        jwt_logger.warning(f"User not found for ID: {current_user_id}")
        raise HTTPException(status_code=404, detail="User not found")
    return user