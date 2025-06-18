from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from core.config import get_settings
from db.session import get_db
from models.user import User
from schemas.user import UserCreate, User as UserSchema
from schemas.token import Token
from crud.user import get_user_by_email, create_user
from auth.jwt import (
    verify_password,
    create_access_token,
    create_refresh_token,
    get_current_user
)
from utils.logger import jwt_logger
from utils.password_validator import get_password_requirements
from slowapi import Limiter
from slowapi.util import get_remote_address
from utils.rate_limit import should_rate_limit
from pydantic import ValidationError

router = APIRouter(prefix="/users", tags=["users"])
settings = get_settings()

# Initialize rate limiter for public endpoints
limiter = Limiter(key_func=get_remote_address)

def exempt_when(request: Request) -> bool:
    """Check if request should be exempt from rate limiting."""
    return not should_rate_limit(request)

def get_user_identifier(request: Request) -> str:
    """Get user identifier for rate limiting."""
    if not hasattr(request.state, 'user'):
        return get_remote_address(request)
    return str(request.state.user.id)

@router.get("/password-requirements")
async def get_password_requirements_endpoint():
    """Get password requirements for the frontend."""
    return {"requirements": get_password_requirements()}

@router.post("/register", response_model=UserSchema)
@limiter.limit("5/minute", exempt_when=lambda: exempt_when)  # Rate limit: 5 requests per minute per IP
async def register_user(
    request: Request,
    user: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        db_user = await get_user_by_email(db, email=user.email)
        if db_user:
            jwt_logger.warning(f"Registration failed: Email already registered: {user.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        jwt_logger.info(f"Creating new user: {user.email}")
        return await create_user(db=db, user=user)
    except ValidationError as e:
        jwt_logger.warning(f"Registration failed: Validation error for {user.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )

@router.post("/login", response_model=Token)
@limiter.limit("5/minute", exempt_when=lambda: exempt_when)  # Rate limit: 5 requests per minute per IP
async def login_for_access_token(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    user = await get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        jwt_logger.warning(f"Login failed for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    jwt_logger.info(f"User logged in successfully: {user.email}")
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserSchema)
@limiter.limit("30/minute", key_func=get_user_identifier, exempt_when=lambda: exempt_when)  # Rate limit: 30 requests per minute per user
async def read_users_me(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    jwt_logger.info(f"User profile accessed: {current_user.email}")
    return current_user

@router.post("/refresh-token", response_model=Token)
@limiter.limit("30/minute", key_func=get_user_identifier, exempt_when=lambda: exempt_when)  # Rate limit: 30 requests per minute per user
async def refresh_token(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    jwt_logger.info(f"Refreshing token for user: {current_user.email}")
    access_token = create_access_token(data={"sub": current_user.email})
    refresh_token = create_refresh_token(data={"sub": current_user.email})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
    
