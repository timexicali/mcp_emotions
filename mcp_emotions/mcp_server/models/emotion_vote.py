from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import UUID
from db.base import Base

class EmotionVote(Base):
    __tablename__ = "emotion_votes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    feedback_id = Column(Integer, ForeignKey("feedback.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    label = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    vote = Column(Boolean, nullable=False)
    comment = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False) 