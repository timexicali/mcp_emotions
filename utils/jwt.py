from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
import os
from dotenv import load_dotenv
from .logger import jwt_logger
from datetime import timedelta

load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")  # Change this in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a new JWT token
    """
    try:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        jwt_logger.info(f"Created JWT token for user {data.get('sub')}")
        return encoded_jwt
    except Exception as e:
        jwt_logger.error(f"Error creating JWT token: {str(e)}")
        raise

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Validate JWT token and return user data
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        jwt_logger.info("Attempting to validate JWT token")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            jwt_logger.warning("JWT token validation failed: no user_id in payload")
            raise credentials_exception
        jwt_logger.info(f"Successfully validated JWT token for user {user_id}")
        return user_id
    except JWTError as e:
        jwt_logger.error(f"JWT validation error: {str(e)}")
        raise credentials_exception
    except Exception as e:
        jwt_logger.error(f"Unexpected error during JWT validation: {str(e)}")
        raise credentials_exception 

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:

    try:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        jwt_logger.info(f"Created refresh token for user {data.get('sub')}")
        return encoded_jwt
    except Exception as e:
        jwt_logger.error(f"Error creating refresh token: {str(e)}")
        raise