from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.user import User
from utils.security import verify_password
from schemas.user import UserCreate, UserUpdate
from auth.jwt import get_password_hash
import uuid

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).filter(User.email == email))
    return result.scalar_one_or_none()

async def get_user_by_id(db: AsyncSession, user_id: str):
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()

async def authenticate_user(db: AsyncSession, email: str, password: str):
    user = await get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

async def create_user(db: AsyncSession, user: UserCreate) -> User:
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def update_user(db: AsyncSession, user: User, user_update: UserUpdate) -> User:
    if user_update.password is not None:
        user.hashed_password = get_password_hash(user_update.password)
    if user_update.email is not None:
        user.email = user_update.email
    if user_update.name is not None:
        user.name = user_update.name
    
    await db.commit()
    await db.refresh(user)
    return user

async def delete_user(db: AsyncSession, user: User) -> None:
    user.is_active = False
    await db.commit()