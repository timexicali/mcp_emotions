from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.user import User
from schemas.user import UserCreate
import uuid

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()


async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    new_user = User(
        id=uuid.uuid4(),
        email=user_in.email,
        name=user_in.name
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user