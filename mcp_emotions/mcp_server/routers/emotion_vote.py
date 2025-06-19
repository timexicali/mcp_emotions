from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_db
from models.emotion_vote import EmotionVote
from schemas.emotion_vote import EmotionVoteCreate, EmotionVoteResponse
from models.user import User
from auth.jwt import get_current_user
from sqlalchemy import select, and_
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="/feedback", tags=["feedback"])
limiter = Limiter(key_func=get_remote_address)

@router.post("/emotion-vote", response_model=EmotionVoteResponse)
@limiter.limit("30/minute")
async def emotion_vote(
    request: Request,
    vote: EmotionVoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Prevent duplicate votes per feedback/label/user
    existing = await db.execute(
        select(EmotionVote).where(
            and_(
                EmotionVote.feedback_id == vote.feedback_id,
                EmotionVote.user_id == current_user.id,
                EmotionVote.label == vote.label
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You have already voted for this emotion on this feedback.")

    db_vote = EmotionVote(
        feedback_id=vote.feedback_id,
        user_id=current_user.id,
        label=vote.label,
        score=vote.score,
        vote=vote.vote,
        comment=vote.comment
    )
    db.add(db_vote)
    await db.commit()
    await db.refresh(db_vote)
    
    # Convert the SQLAlchemy model to response format
    response_data = {
        "id": db_vote.id,
        "feedback_id": db_vote.feedback_id,
        "user_id": str(db_vote.user_id),  # Convert UUID to string
        "label": db_vote.label,
        "score": db_vote.score,
        "vote": db_vote.vote,
        "comment": db_vote.comment or "",
        "created_at": db_vote.created_at.isoformat() if db_vote.created_at else None  # Convert datetime to string
    }
    
    return response_data 