from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from langdetect import detect
from db.session import get_db
from models.feedback import Feedback
from models.language import Language
from schemas.feedback import FeedbackCreate, FeedbackResponse
from models.user import User
from auth.jwt import get_current_user
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="/feedback", tags=["feedback"])
limiter = Limiter(key_func=get_remote_address)

async def get_language_id(db: AsyncSession, language_code: str) -> int:
    """Get language_id from language code, or return None if not found."""
    try:
        result = await db.execute(
            select(Language.id).where(Language.code == language_code.lower())
        )
        language_id = result.scalar_one_or_none()
        return language_id
    except Exception:
        return None

@router.post("/submit", response_model=FeedbackResponse)
@limiter.limit("10/minute")  # 10 feedbacks per minute per IP
async def submit_feedback(
    request: Request,
    feedback: FeedbackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Detect language from text or use provided language_code
    detected_language = None
    language_id = None
    
    if feedback.language_code:
        # Use provided language code
        detected_language = feedback.language_code.lower()
    else:
        # Auto-detect language from text
        try:
            detected_language = detect(feedback.text)
        except Exception:
            detected_language = "en"  # Default to English if detection fails
    
    # Get language_id from the languages table
    if detected_language:
        language_id = await get_language_id(db, detected_language)
    
    db_feedback = Feedback(
        user_id=current_user.id,
        language_id=language_id,
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
        "language_id": db_feedback.language_id,
        "text": db_feedback.text,
        "predicted_emotions": db_feedback.predicted_emotions,
        "suggested_emotions": db_feedback.suggested_emotions or [],
        "comment": db_feedback.comment or "",
        "language_code": detected_language,
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
    
    # Convert to response format and include language_code for each feedback
    response_feedbacks = []
    for feedback in feedbacks:
        # Get language code if language_id exists
        language_code = None
        if feedback.language_id:
            lang_result = await db.execute(
                select(Language.code).where(Language.id == feedback.language_id)
            )
            language_code = lang_result.scalar_one_or_none()
        
        response_data = {
            "id": feedback.id,
            "user_id": str(feedback.user_id),
            "language_id": feedback.language_id,
            "text": feedback.text,
            "predicted_emotions": feedback.predicted_emotions,
            "suggested_emotions": feedback.suggested_emotions or [],
            "comment": feedback.comment or "",
            "language_code": language_code,
            "created_at": feedback.created_at.isoformat() if feedback.created_at else None
        }
        response_feedbacks.append(response_data)
    
    return response_feedbacks 