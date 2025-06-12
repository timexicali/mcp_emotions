# mcp_server.py - Advanced MCP server using GoEmotions for multilabel emotion detection

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

settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user.router, prefix=settings.API_V1_STR)

MODEL_MAP = {
    "en": "bhadresh-savani/bert-base-go-emotion",
    "es": "finiteautomata/bertweet-base-emotion-analysis"
}
# Cached models and tokenizers
tokenizers = {}
models = {}


# Load tokenizer and model for GoEmotions
MODEL_NAME = "bhadresh-savani/bert-base-go-emotion"
tokenizer = None
model = None

def load_model(lang: str = "en"):
    lang = lang.lower()
    if lang not in MODEL_MAP:
        lang = "en"  # Fallback to English if unsupported

    if lang not in models:
        print(f"Loading model for language: {lang}")
        tokenizers[lang] = AutoTokenizer.from_pretrained(MODEL_MAP[lang])
        models[lang] = AutoModelForSequenceClassification.from_pretrained(MODEL_MAP[lang])
        models[lang].eval()  # Set model to evaluation mode

    return tokenizers[lang], models[lang]

# Emotion labels from GoEmotions dataset
emotion_labels = [
    "admiration", "amusement", "anger", "annoyance", "approval", "caring", "confusion", "curiosity",
    "desire", "disappointment", "disapproval", "disgust", "embarrassment", "excitement", "fear", "gratitude",
    "grief", "joy", "love", "nervousness", "optimism", "pride", "realization", "relief", "remorse", "sadness",
    "surprise", "neutral"
]

# Input and output schemas
class ToolInput(BaseModel):
    message: str
    context: Optional[str] = None
    session_id: Optional[str] = None

class ToolOutput(BaseModel):
    session_id: str
    detected_emotions: List[str]
    confidence_scores: Dict[str, float]
    recommendation: Optional[str] = None

@app.post("/tools/emotion-detector")
async def detect_emotion(
    input: ToolInput,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> ToolOutput:
    try:
        # Preprocess input
        try:
            cleaned_text = preprocess_input(input.message)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
            
        # Detect language
        try:
            language = detect(cleaned_text)
        except Exception:
            language = "en"  # default fallback if detection fails

        # Load model/tokenizer based on language
        tokenizer, model = load_model(lang=language if language in ["en", "es"] else "en")

        # Generate session ID
        session_id = input.session_id or str(uuid.uuid4())
        
        # Tokenize and get predictions
        inputs = tokenizer(cleaned_text, return_tensors="pt", truncation=True, max_length=512)
        with torch.no_grad():
            logits = model(**inputs).logits
            probs = torch.sigmoid(logits)[0]  # Multi-label sigmoid activation

        threshold = 0.15  # Lower threshold for broader emotion detection
        detected = [(emotion_labels[i], float(probs[i])) for i in range(len(probs)) if probs[i] > threshold]
        detected_emotions = [label for label, _ in detected]
        confidence_scores = {label: round(score, 3) for label, score in detected}

        try:
            # Create emotion log entry
            emotion_log = EmotionLog(
                session_id=session_id,
                message=input.message,
                emotions=json.dumps(detected_emotions),
                context=input.context or "general",
                user_id=current_user.id
            )
            db.add(emotion_log)
            await db.commit()
        except Exception as e:
            print(f"Database error: {e}")
            # Continue even if database operation fails
            pass

        # Simple recommendation logic
        recommendation = None
        if not detected_emotions:
            recommendation = "No strong emotions detected. Try expressing more detail."
        elif "remorse" in detected_emotions:
            recommendation = "Try to be kind to yourself—consider reflecting without judgment."
        elif "gratitude" in detected_emotions:
            recommendation = "That's great! Maybe write down what you're thankful for."
        elif "anger" in detected_emotions:
            recommendation = "Pause, breathe, and consider what boundary may feel crossed."

        return ToolOutput(
            session_id=session_id,
            detected_emotions=detected_emotions,
            confidence_scores=confidence_scores,
            recommendation=recommendation
        )
    except Exception as e:
        print(f"Error in emotion detection: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error processing emotion detection request"
        )

@app.get("/tools/emotion-history/{session_id}")
async def get_emotion_history(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Query emotion logs for the session
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
            "timestamp": log.created_at
        })

    return {
        "session_id": session_id,
        "history": history
    }

@app.get("/")
async def root():
    return {"message": "Welcome to MCP Server"}

@app.on_event("startup")
async def startup():
    pass