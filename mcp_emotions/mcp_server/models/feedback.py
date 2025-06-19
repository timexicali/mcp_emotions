from sqlalchemy import Column, BigInteger, String, Boolean, Float, Text, ForeignKey, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from db.base import Base

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)
    predicted_emotions = Column(JSONB, nullable=False)
    suggested_emotions = Column(ARRAY(Text), nullable=True)
    comment = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False) 