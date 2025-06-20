from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from dotenv import load_dotenv
from typing import List

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "MCP Server"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # JWT Settings
    JWT_SECRET_KEY: str = "your-secret-key-here"  # Change this in production
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@db:5432/mcp_db")
    
    # Rate Limit Settings
    RATE_LIMIT_WHITELIST_IPS: List[str] = [
        "127.0.0.1",  # localhost
        "::1",        # localhost IPv6
        "10.0.0.0/8", # internal network
        "172.16.0.0/12", # internal network
        "192.168.0.0/16"  # internal network
    ]
    RATE_LIMIT_INTERNAL_ROLES: List[str] = ["admin", "internal", "system"]
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # This will ignore extra fields from the environment

@lru_cache()
def get_settings():
    return Settings() 