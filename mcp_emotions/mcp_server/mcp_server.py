from fastapi import FastAPI, Depends, HTTPException
from langdetect import detect
from fastapi.middleware.cors import CORSMiddleware
from core.config import get_settings
from routers import user
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
from pydantic import BaseModel
from utils.preprocessing import preprocess_input
from utils.sarcasm import detect_sarcasm, load_sarcasm_model
from services.recommender import generate_recommendation

settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router, prefix=settings.API_V1_STR)

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
    message: str
    context: Optional[str] = None
    session_id: Optional[str] = None

class ToolOutput(BaseModel):
    session_id: str
    detected_emotions: List[str]
    confidence_scores: Dict[str, float]
    sarcasm_detected: bool
    recommendation: Optional[str] = None

@app.post("/tools/emotion-detector")
async def detect_emotion(
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
        confidence_scores = {label: round(score, 3) for label, score in detected}

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
async def get_user_emotion_history(
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
async def get_emotion_history(
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
                print(f"✓ {lang} emotion model loaded and warmed up")
            except Exception as e:
                print(f"❌ Error loading {lang} emotion model: {str(e)}")
                raise
        print("\nLoading sarcasm detection models...")
        for lang in ["en", "es"]:
            print(f"Loading {lang} sarcasm model...")
            try:
                tokenizer, model = load_sarcasm_model(lang)
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