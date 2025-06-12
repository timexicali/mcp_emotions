def generate_recommendation(detected_emotions: list, is_sarcastic: bool) -> str | None:
    if is_sarcastic:
        if any(e in detected_emotions for e in ["admiration", "gratitude", "approval"]):
            return "It sounds like you might be joking or using sarcasm—want to explore how you really feel?"
        if any(e in detected_emotions for e in ["anger", "annoyance", "disappointment"]):
            return "Seems like you're expressing frustration through sarcasm. Maybe try writing what’s really bothering you?"
        if "amusement" in detected_emotions:
            return "Using humor is totally okay—just be sure you're not masking something deeper."

    if not detected_emotions:
        return "I'm not picking up strong feelings—try writing a bit more or being more specific."

    if "remorse" in detected_emotions:
        return "Be gentle with yourself—everyone makes mistakes. You’re doing your best."

    if "gratitude" in detected_emotions:
        return "That’s wonderful to hear. Maybe note what you're thankful for to revisit later."

    if "anger" in detected_emotions:
        return "Feeling angry? That’s valid. Think about what boundary was crossed or what you need."

    if "sadness" in detected_emotions:
        return "Sounds like you're feeling down. It’s okay to feel that way—consider reaching out or writing more."

    if "joy" in detected_emotions:
        return "I'm glad you're feeling good. You might want to capture what’s bringing you joy today."

    return None