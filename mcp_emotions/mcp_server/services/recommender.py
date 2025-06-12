# services/recommender.py

from typing import List, Optional

def generate_recommendation(detected_emotions: List[str], is_sarcastic: bool, language: str = "en") -> Optional[str]:
    """
    Generate an intuitive, supportive recommendation based on emotional tone, sarcasm, and language.
    """
    if language == "es":
        if is_sarcastic:
            if any(e in detected_emotions for e in ["admiration", "gratitude", "approval"]):
                return "Parece que estás bromeando o usando sarcasmo—¿quieres explorar cómo te sientes realmente?"
            if any(e in detected_emotions for e in ["anger", "annoyance", "disappointment"]):
                return "Parece que estás expresando frustración con sarcasmo. Tal vez podrías escribir lo que realmente te molesta."
            if "amusement" in detected_emotions:
                return "El humor está bien—solo asegúrate de que no estés ocultando algo más profundo."

        if not detected_emotions:
            return "No detecté emociones claras—puedes ser un poco más específico."

        if "remorse" in detected_emotions:
            return "Sé amable contigo mismo—todos cometemos errores."

        if "gratitude" in detected_emotions:
            return "¡Eso es maravilloso! Puedes anotar por qué estás agradecido."

        if "anger" in detected_emotions:
            return "Está bien estar enojado. Piensa si alguien cruzó un límite personal."

        if "sadness" in detected_emotions:
            return "Parece que estás triste. Está bien sentirse así—considera escribir más o hablar con alguien."

        if "joy" in detected_emotions:
            return "¡Qué bien que te sientes feliz! Tal vez escribe qué te dio alegría hoy."

        return None

    else:
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