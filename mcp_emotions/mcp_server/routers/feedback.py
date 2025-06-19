from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from db.session import get_db
from models.feedback import Feedback
from schemas.feedback import FeedbackCreate, FeedbackResponse
from models.user import User
from auth.jwt import get_current_user
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="/feedback", tags=["feedback"])
limiter = Limiter(key_func=get_remote_address)

@router.post("/submit", response_model=FeedbackResponse)
@limiter.limit("10/minute")  # 10 feedbacks per minute per IP
async def submit_feedback(
    request: Request,
    feedback: FeedbackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_feedback = Feedback(
        user_id=current_user.id,
        text=feedback.text,
        predicted_emotions=feedback.predicted_emotions,
        suggested_emotions=feedback.suggested_emotions if feedback.suggested_emotions else None,
        comment=feedback.comment if feedback.comment else None
    )
    db.add(db_feedback)
    await db.commit()
    await db.refresh(db_feedback)
    
    # Convert the SQLAlchemy model to response format
    response_data = {
        "id": db_feedback.id,
        "user_id": str(db_feedback.user_id),
        "text": db_feedback.text,
        "predicted_emotions": db_feedback.predicted_emotions,
        "suggested_emotions": db_feedback.suggested_emotions or [],
        "comment": db_feedback.comment or "",
        "created_at": db_feedback.created_at.isoformat() if db_feedback.created_at else None
    }
    
    return response_data

@router.get("/list", response_model=list[FeedbackResponse])
@limiter.limit("30/minute")
async def list_feedback(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all feedback records for the current user"""
    result = await db.execute(
        select(Feedback)
        .where(Feedback.user_id == current_user.id)
        .order_by(Feedback.created_at.desc())
    )
    feedbacks = result.scalars().all()
    return feedbacks 