from sqlalchemy import Column, String, ForeignKey, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import UUID
from db.base import Base
import uuid

class EmotionLog(Base):
    __tablename__ = "emotion_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String, nullable=False, index=True)
    message = Column(String, nullable=False)
    emotions = Column(String, nullable=False)  # JSON string of emotions
    context = Column(String, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False) 