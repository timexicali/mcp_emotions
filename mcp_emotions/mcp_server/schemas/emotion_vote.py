from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID

class EmotionVoteCreate(BaseModel):
    feedback_id: int
    label: str
    score: float
    vote: bool
    comment: Optional[str] = Field(None, max_length=500)

class EmotionVoteResponse(EmotionVoteCreate):
    id: int
    user_id: str
    created_at: str
    
    class Config:
        from_attributes = True 