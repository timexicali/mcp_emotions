from typing import List, Dict, Optional
from pydantic import BaseModel, Field, validator
from datetime import datetime
from uuid import UUID

class FeedbackBase(BaseModel):
    text: str
    predicted_emotions: List[str]
    suggested_emotions: Optional[List[str]] = None
    comment: Optional[str] = Field(None, max_length=500)

    @validator('suggested_emotions', pre=True, always=True)
    def deduplicate_suggested(cls, v):
        if v:
            return list(dict.fromkeys(v))
        return v

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackResponse(FeedbackBase):
    id: int
    user_id: str  # Will be converted from UUID to string
    created_at: str  # Will be converted from datetime to string
    
    class Config:
        from_attributes = True  # Allow conversion from SQLAlchemy model 