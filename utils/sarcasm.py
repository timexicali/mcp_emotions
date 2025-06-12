from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# Model map by language
MODEL_MAP_SARCASM = {
    "en": "helinivan/english-sarcasm-detector",
    "es": "dtomas/roberta-base-bne-irony",
    "default": "helinivan/multilingual-sarcasm-detector"
}

tokenizers_sarcasm = {}
models_sarcasm = {}

def load_sarcasm_model(lang="en"):
    lang = lang.lower()
    model_name = MODEL_MAP_SARCASM.get(lang, MODEL_MAP_SARCASM["default"])

    if lang not in models_sarcasm:
        print(f"Loading sarcasm model for: {lang}")
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSequenceClassification.from_pretrained(model_name)
        tokenizers_sarcasm[lang] = tokenizer
        models_sarcasm[lang] = model

    return tokenizers_sarcasm[lang], models_sarcasm[lang]

def detect_sarcasm(text: str, lang="en") -> bool:
    tokenizer, model = load_sarcasm_model(lang)
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)

    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
        predicted_class = torch.argmax(probs, dim=-1).item()

    # Class label 1 typically means "sarcastic" for binary models
    return predicted_class == 1