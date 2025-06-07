from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from databases import Database
import os

# Base database URL without driver
BASE_DATABASE_URL = "postgresql://mcpsuper:mysecurepass@db:5432/mcpdb"

# Set this to your PostgreSQL URI or use env variable
DATABASE_URL = os.getenv("DATABASE_URL", f"{BASE_DATABASE_URL}")

# SQLAlchemy metadata object
metadata = MetaData()

# Async SQLAlchemy engine (for use with AsyncSession)
async_engine = create_async_engine(f"postgresql+asyncpg://{DATABASE_URL.split('://')[1]}", future=True, echo=True)

# Synchronous engine (used for Alembic migrations if needed)
sync_engine = create_engine(DATABASE_URL, future=True)

# Async database instance for 'databases' package
database = Database(f"postgresql+asyncpg://{DATABASE_URL.split('://')[1]}")

# Async session factory
async_session = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Dependency for FastAPI routes
async def get_db():
    async with async_session() as session:
        yield session