from fastapi import FastAPI, Depends, HTTPException, Request
from langdetect import detect
from fastapi.middleware.cors import CORSMiddleware
from core.config import get_settings
from routers import user, feedback, emotion_vote
from db.session import engine, Base, get_db
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.user import User
from models.emotion_log import EmotionLog
from auth.jwt import get_current_user
import torch
import uuid
import json
from typing import Optional, List, Dict
from pydantic import BaseModel, constr
from utils.preprocessing import preprocess_input
from utils.sarcasm import detect_sarcasm, load_sarcasm_model
from services.recommender import generate_recommendation
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from utils.rate_limit import should_rate_limit

settings = get_settings()

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

def get_user_identifier(request: Request) -> str:
    """Get user identifier for rate limiting."""
    if not hasattr(request.state, 'user'):
        return get_remote_address(request)
    return str(request.state.user.id)

def exempt_when(request: Request) -> bool:
    """Check if request should be exempt from rate limiting."""
    return not should_rate_limit(request)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Add rate limiter to the app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "http://frontend:3000",   # Docker frontend container
        "https://mcp-emotions.vercel.app",
        "https://emotionwise.ai",
        "https://www.emotionwise.ai"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

app.include_router(user.router, prefix=settings.API_V1_STR)
app.include_router(feedback.router, prefix=settings.API_V1_STR)
app.include_router(emotion_vote.router, prefix=settings.API_V1_STR)

MODEL_MAP = {
    "en": "bhadresh-savani/bert-base-go-emotion",
    "es": "finiteautomata/bertweet-base-emotion-analysis"
}

# Cached models and tokenizers
tokenizers = {}
models = {}

def load_model(lang: str = "en"):
    lang = lang.lower()
    if lang not in MODEL_MAP:
        lang = "en"

    if lang not in models:
        print(f"Loading model for language: {lang}")
        tokenizers[lang] = AutoTokenizer.from_pretrained(MODEL_MAP[lang])
        models[lang] = AutoModelForSequenceClassification.from_pretrained(MODEL_MAP[lang])
        models[lang].eval()
        if torch.cuda.is_available():
            models[lang] = models[lang].cuda()
        dummy_input = tokenizers[lang]("test", return_tensors="pt", truncation=True, max_length=512)
        if torch.cuda.is_available():
            dummy_input = {k: v.cuda() for k, v in dummy_input.items()}
        with torch.no_grad():
            models[lang](**dummy_input)

    return tokenizers[lang], models[lang]

emotion_labels = [
    "admiration", "amusement", "anger", "annoyance", "approval", "caring", "confusion", "curiosity",
    "desire", "disappointment", "disapproval", "disgust", "embarrassment", "excitement", "fear", "gratitude",
    "grief", "joy", "love", "nervousness", "optimism", "pride", "realization", "relief", "remorse", "sadness",
    "surprise", "neutral"
]

class ToolInput(BaseModel):
    message: constr(min_length=1, max_length=300)
    context: Optional[str] = None
    session_id: Optional[str] = None

class ToolOutput(BaseModel):
    session_id: str
    detected_emotions: List[str]
    confidence_scores: Dict[str, int]
    sarcasm_detected: bool
    recommendation: Optional[str] = None

@app.post("/tools/emotion-detector")
@limiter.limit("30/minute", key_func=get_user_identifier, exempt_when=lambda: exempt_when)
async def detect_emotion(
    request: Request,
    input: ToolInput,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> ToolOutput:
    try:
        try:
            cleaned_text = preprocess_input(input.message)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        try:
            language = detect(cleaned_text)
        except Exception:
            language = "en"

        is_sarcastic = detect_sarcasm(cleaned_text, lang=language)

        tokenizer, model = load_model(lang=language if language in ["en", "es"] else "en")

        session_id = input.session_id or str(uuid.uuid4())

        inputs = tokenizer(cleaned_text, return_tensors="pt", truncation=True, max_length=512)
        with torch.no_grad():
            logits = model(**inputs).logits
            probs = torch.sigmoid(logits)[0]

        threshold = 0.15
        detected = [(emotion_labels[i], float(probs[i])) for i in range(len(probs)) if probs[i] > threshold]
        detected_emotions = [label for label, _ in detected]
        confidence_scores = {label: int(round(score * 100)) for label, score in detected}

        try:
            emotion_log = EmotionLog(
                session_id=session_id,
                message=input.message,
                emotions=json.dumps(detected_emotions),
                context=input.context or "general",
                user_id=current_user.id,
                sarcasm_detected=is_sarcastic
            )
            db.add(emotion_log)
            await db.commit()
        except Exception as e:
            print(f"Database error: {e}")
            pass

        recommendation = generate_recommendation(detected_emotions, is_sarcastic)

        return ToolOutput(
            session_id=session_id,
            detected_emotions=detected_emotions,
            confidence_scores=confidence_scores,
            sarcasm_detected=is_sarcastic,
            recommendation=recommendation
        )
    except Exception as e:
        print(f"Error in emotion detection: {e}")
        raise HTTPException(status_code=500, detail="Error processing emotion detection request")

@app.get("/tools/emotion-history/user")
@limiter.limit("30/minute", key_func=get_user_identifier, exempt_when=lambda: exempt_when)
async def get_user_emotion_history(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(EmotionLog)
        .where(EmotionLog.user_id == current_user.id)
        .order_by(EmotionLog.created_at.desc())
    )
    logs = result.scalars().all()
    user_history = []
    for log in logs:
        try:
            emotions = json.loads(log.emotions)
        except json.JSONDecodeError:
            emotions = []
        user_history.append({
            "session_id": log.session_id,
            "message": log.message,
            "emotions": emotions,
            "context": log.context,
            "sarcasm_detected": log.sarcasm_detected,
            "timestamp": log.created_at
        })
    return {"user_id": str(current_user.id), "history": user_history}

@app.get("/tools/emotion-history/{session_id}")
@limiter.limit("30/minute", key_func=get_user_identifier, exempt_when=lambda: exempt_when)
async def get_emotion_history(
    request: Request,
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(EmotionLog)
        .where(EmotionLog.session_id == session_id)
        .order_by(EmotionLog.created_at)
    )
    logs = result.scalars().all()
    history = []
    for log in logs:
        try:
            emotions = json.loads(log.emotions)
        except json.JSONDecodeError:
            emotions = []
        history.append({
            "message": log.message,
            "emotions": emotions,
            "context": log.context,
            "sarcasm_detected": log.sarcasm_detected,
            "timestamp": log.created_at
        })
    return {"session_id": session_id, "history": history}

@app.get("/")
async def root():
    return {"message": "Welcome to MCP Server"}

@app.on_event("startup")
async def startup():
    try:
        print("\n=== Starting Model Preloading ===")
        print("\nLoading emotion detection models...")
        for lang in ["en", "es"]:
            print(f"Loading {lang} emotion model...")
            try:
                tokenizer, model = load_model(lang)
                # Warm up the model with a dummy text
                dummy_text = "Hello"
                inputs = tokenizer(dummy_text, return_tensors="pt", truncation=True, max_length=512)
                if torch.cuda.is_available():
                    inputs = {k: v.cuda() for k, v in inputs.items()}
                with torch.no_grad():
                    _ = model(**inputs)
                print(f"✓ {lang} emotion model loaded and warmed up")
            except Exception as e:
                print(f"❌ Error loading {lang} emotion model: {str(e)}")
                raise
        print("\nLoading sarcasm detection models...")
        for lang in ["en", "es"]:
            print(f"Loading {lang} sarcasm model...")
            try:
                tokenizer, model = load_sarcasm_model(lang)
                # Warm up the sarcasm model with a dummy text
                dummy_text = "Hello"
                inputs = tokenizer(dummy_text, return_tensors="pt", truncation=True, max_length=512)
                if torch.cuda.is_available():
                    inputs = {k: v.cuda() for k, v in inputs.items()}
                with torch.no_grad():
                    _ = model(**inputs)
                print(f"✓ {lang} sarcasm model loaded and warmed up")
            except Exception as e:
                print(f"❌ Error loading {lang} sarcasm model: {str(e)}")
                raise
        print("\n=== All Models Loaded Successfully! ===\n")

        # Create database tables
        print("\n=== Creating Database Tables ===")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✓ Database tables created successfully\n")
    except Exception as e:
        print(f"\n❌ Critical error during startup: {str(e)}")
        raise e

# Example of a user-based rate limit
@app.get("/tools/emotion-history/user/detailed")
@limiter.limit("100/hour", key_func=get_user_identifier)  # Rate limit: 100 requests per hour per user
async def get_detailed_user_emotion_history(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(EmotionLog)
        .where(EmotionLog.user_id == current_user.id)
        .order_by(EmotionLog.created_at.desc())
    )
    logs = result.scalars().all()
    user_history = []
    for log in logs:
        try:
            emotions = json.loads(log.emotions)
        except json.JSONDecodeError:
            emotions = []
        user_history.append({
            "session_id": log.session_id,
            "message": log.message,
            "emotions": emotions,
            "context": log.context,
            "sarcasm_detected": log.sarcasm_detected,
            "timestamp": log.created_at,
            "confidence_scores": json.loads(log.confidence_scores) if log.confidence_scores else {}
        })
    return {"user_id": str(current_user.id), "history": user_history}

@app.post("/tools/emotion-detector/public")
@limiter.limit("5/hour")  # 5 tries per hour per IP
async def detect_emotion_public(
    request: Request,
    input: ToolInput
) -> ToolOutput:
    try:
        try:
            cleaned_text = preprocess_input(input.message)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        try:
            language = detect(cleaned_text)
        except Exception:
            language = "en"

        is_sarcastic = detect_sarcasm(cleaned_text, lang=language)

        tokenizer, model = load_model(lang=language if language in ["en", "es"] else "en")

        session_id = input.session_id or str(uuid.uuid4())

        inputs = tokenizer(cleaned_text, return_tensors="pt", truncation=True, max_length=512)
        with torch.no_grad():
            logits = model(**inputs).logits
            probs = torch.sigmoid(logits)[0]

        threshold = 0.15
        detected = [(emotion_labels[i], float(probs[i])) for i in range(len(probs)) if probs[i] > threshold]
        detected_emotions = [label for label, _ in detected]
        confidence_scores = {label: int(round(score * 100)) for label, score in detected}

        recommendation = generate_recommendation(detected_emotions, is_sarcastic)

        return ToolOutput(
            session_id=session_id,
            detected_emotions=detected_emotions,
            confidence_scores=confidence_scores,
            sarcasm_detected=is_sarcastic,
            recommendation=recommendation
        )
    except RateLimitExceeded:
        raise HTTPException(
            status_code=429,
            detail="You have reached the free trial limit. Please register for unlimited access."
        )
    except Exception as e:
        print(f"Error in public emotion detection: {e}")
        raise HTTPException(status_code=500, detail="Error processing emotion detection request")