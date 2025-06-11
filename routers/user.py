from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from schemas.user import UserCreate, UserRead, UserLogin, Token
from crud.user import create_user, get_user_by_email, authenticate_user, get_user_by_id
from utils.jwt import create_access_token, get_current_user, oauth2_scheme, SECRET_KEY, ALGORITHM
from utils.logger import jwt_logger
from datetime import timedelta
from jose import jwt, JWTError

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
        data={"sub": str(user.id), "type": "access"}
    )
    refresh_token = create_access_token(
        data={"sub": str(user.id), "type": "refresh"},
        expires_delta=timedelta(days=7)
    )
    jwt_logger.info(f"Login successful for user: {form_data.username}")
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserRead)
async def read_users_me(
    current_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    jwt_logger.info(f"Fetching user profile for user ID: {current_user_id}")
    user = await get_user_by_id(db, current_user_id)
    if not user:
        jwt_logger.warning(f"User not found for ID: {current_user_id}")
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/refresh-token", response_model=Token)
async def refresh_token(
    token: str = Depends(oauth2_scheme)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Not a refresh token")
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        new_access_token = create_access_token(data={"sub": user_id, "type": "access"})
        new_refresh_token = create_access_token(
            data={"sub": user_id, "type": "refresh"},
            expires_delta=timedelta(days=7)
        )
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }

    except JWTError:
        raise HTTPException(status_code=401, detail="Token refresh failed")
    
