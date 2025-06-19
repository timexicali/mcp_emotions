from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import re 

# Model map by language
MODEL_MAP_SARCASM = {
    "en": "helinivan/english-sarcasm-detector",
    "es": "dtomas/roberta-base-bne-irony",
    "default": "helinivan/multilingual-sarcasm-detector"
}

# Cache for loaded models and tokenizers
tokenizers_sarcasm = {}
models_sarcasm = {}

def load_sarcasm_model(lang="en"):
    lang = lang.lower()
    model_name = MODEL_MAP_SARCASM.get(lang, MODEL_MAP_SARCASM["default"])

    if lang not in models_sarcasm:
        print(f"Loading sarcasm model for: {lang}")
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSequenceClassification.from_pretrained(model_name)
        model.eval()  # Set model to evaluation mode
        if torch.cuda.is_available():
            model = model.cuda()
        # Warm up the model with a dummy input
        dummy_input = tokenizer("test", return_tensors="pt", truncation=True, padding=True)
        if torch.cuda.is_available():
            dummy_input = {k: v.cuda() for k, v in dummy_input.items()}
        with torch.no_grad():
            model(**dummy_input)
        tokenizers_sarcasm[lang] = tokenizer
        models_sarcasm[lang] = model

    return tokenizers_sarcasm[lang], models_sarcasm[lang]

def detect_sarcasm(text: str, lang="en") -> bool:
    tokenizer, model = load_sarcasm_model(lang)
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    if torch.cuda.is_available():
        inputs = {k: v.cuda() for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
        predicted_class = torch.argmax(probs, dim=-1).item()

    lowered = re.sub(r'[^\w\s]', '', text.lower())

    if lang == "es":
        sarcasm_cues = [
            "🤣", "🙄", "😒", "...", "claro", "aja", "como no", "sí, seguro",
            "otra vez", "perfecto", "ya ni la friegan", "así o más", "seguro que sí"
        ]
    else:
        sarcasm_cues = [
            "🤣", "🙄", "😒", "...", "yeah right", "as if", "sure they did", "you know the",
            "great job", "all of a sudden", "oh now", "they care", "so the", "of course",
            "nice try", "right...", "classic", "totally"
        ]

    heuristic_match = any(cue in lowered for cue in sarcasm_cues)

    # Safe access to probabilities with bounds checking
    if len(probs) > 1:
        sarcastic_prob = probs[1].item()
        return predicted_class == 1 or (sarcastic_prob > 0.15 and heuristic_match)
    else:
        # Model only outputs single probability/class
        return predicted_class == 1 or heuristic_match