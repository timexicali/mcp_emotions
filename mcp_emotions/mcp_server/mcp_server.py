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
import logging
from typing import Optional, List, Dict
from pydantic import BaseModel
from utils.preprocessing import preprocess_input
from utils.sarcasm import detect_sarcasm, load_sarcasm_model
from services.recommender import generate_recommendation

settings = get_settings()
logger = logging.getLogger("uvicorn.error")

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

def load_model(lang: str = "en"):
    """Load and initialize the emotion detection model for the specified language."""
    if not lang:
        logger.warning("No language specified, defaulting to English")
        lang = "en"
    
    lang = lang.lower()
    if lang not in MODEL_MAP:
        logger.warning(f"Unsupported language '{lang}', defaulting to English")
        lang = "en"

    if lang not in models:
        logger.info(f"Loading model for language: {lang}")
        try:
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
        except Exception as e:
            logger.error(f"Failed to load model for language {lang}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to load emotion detection model for {lang}"
            )

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
    language: Optional[str] = None  # New field to override langdetect

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
            logger.error(f"Input preprocessing failed: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

        # Validate language input
        if input.language and input.language.lower() not in MODEL_MAP:
            logger.warning(f"Invalid language specified: {input.language}, using auto-detection")
            input.language = None

        try:
            language = input.language or detect(cleaned_text)
            if language not in MODEL_MAP:
                logger.warning(f"Detected unsupported language: {language}, defaulting to English")
                language = "en"
        except Exception as e:
            logger.warning(f"Language detection failed: {str(e)}, defaulting to English")
            language = "en"

        is_sarcastic = detect_sarcasm(cleaned_text, lang=language)
        tokenizer, model = load_model(lang=language)
        session_id = input.session_id or str(uuid.uuid4())

        inputs = tokenizer(cleaned_text, return_tensors="pt", truncation=True, max_length=512)
        if torch.cuda.is_available():
            inputs = {k: v.cuda() for k, v in inputs.items()}

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
            logger.error(f"Database error while saving emotion log: {str(e)}")
            # Continue execution even if database operation fails

        recommendation = generate_recommendation(detected_emotions, is_sarcastic, language)

        return ToolOutput(
            session_id=session_id,
            detected_emotions=detected_emotions,
            confidence_scores=confidence_scores,
            sarcasm_detected=is_sarcastic,
            recommendation=recommendation
        )

    except Exception as e:
        logger.error(f"Error in emotion detection: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing emotion detection request")

@app.get("/tools/emotion-history/{session_id}")
async def get_emotion_history(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID is required")

    result = await db.execute(
        select(EmotionLog)
        .where(EmotionLog.session_id == session_id)
        .order_by(EmotionLog.created_at)
    )
    logs = result.scalars().all()

    if not logs:
        logger.warning(f"No emotion history found for session: {session_id}")
        return {"session_id": session_id, "history": []}

    history = []
    for log in logs:
        try:
            emotions = json.loads(log.emotions)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to decode emotions JSON for session {session_id}: {str(e)}")
            emotions = []

        history.append({
            "message": log.message,
            "emotions": emotions,
            "context": log.context,
            "sarcasm_detected": log.sarcasm_detected,
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
    try:
        logger.info("\n=== Starting Model Preloading ===")

        logger.info("\nLoading emotion detection models...")
        for lang in ["en", "es"]:
            try:
                load_model(lang)
                logger.info(f"✓ {lang} emotion model loaded and warmed up")
            except Exception as e:
                logger.error(f"❌ Error loading {lang} emotion model: {str(e)}")
                raise

        logger.info("\nLoading sarcasm detection models...")
        for lang in ["en", "es"]:
            try:
                load_sarcasm_model(lang)
                logger.info(f"✓ {lang} sarcasm model loaded and warmed up")
            except Exception as e:
                logger.error(f"❌ Error loading {lang} sarcasm model: {str(e)}")
                raise

        logger.info("\n=== All Models Loaded Successfully! ===\n")
    except Exception as e:
        logger.critical(f"\n❌ Critical error during model preloading: {str(e)}")
        raise