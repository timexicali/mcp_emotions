# mcp_server.py - Advanced MCP server using GoEmotions for multilabel emotion detection

from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, List, Dict
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from db import database
import torch
import uuid

app = FastAPI()

# Load tokenizer and model for GoEmotions
MODEL_NAME = "bhadresh-savani/bert-base-go-emotion"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)

# Emotion labels from GoEmotions dataset
emotion_labels = [
    "admiration", "amusement", "anger", "annoyance", "approval", "caring", "confusion", "curiosity",
    "desire", "disappointment", "disapproval", "disgust", "embarrassment", "excitement", "fear", "gratitude",
    "grief", "joy", "love", "nervousness", "optimism", "pride", "realization", "relief", "remorse", "sadness",
    "surprise", "neutral"
]

# In-memory session store
emotion_history: Dict[str, List[Dict]] = {}

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
async def detect_emotion(input: ToolInput) -> ToolOutput:
    session_id = input.session_id or str(uuid.uuid4())
    inputs = tokenizer(input.message, return_tensors="pt", truncation=True)
    with torch.no_grad():
        logits = model(**inputs).logits
        probs = torch.sigmoid(logits)[0]  # Multi-label sigmoid activation

    threshold = 0.15  # Lower threshold for broader emotion detection
    detected = [(emotion_labels[i], float(probs[i])) for i in range(len(probs)) if probs[i] > threshold]
    detected_emotions = [label for label, _ in detected]
    confidence_scores = {label: round(score, 3) for label, score in detected}

    # Store history
    emotion_history.setdefault(session_id, []).append({
        "message": input.message,
        "emotions": detected_emotions,
        "context": input.context or "general"
    })

    # Simple recommendation logic
    recommendation = None
    if "remorse" in detected_emotions:
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

@app.get("/tools/emotion-history/{session_id}")
async def get_emotion_history(session_id: str):
    return {"session_id": session_id, "history": emotion_history.get(session_id, [])}

@app.delete("/tools/emotion-history/{session_id}")
async def reset_emotion_history(session_id: str):
    emotion_history.pop(session_id, None)
    return {"message": f"Session {session_id} history reset."}

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.get("/db-test")
async def db_test():
    query = "SELECT 1 as test_value"
    result = await database.fetch_one(query=query)
    return {"db_response": result["test_value"]}