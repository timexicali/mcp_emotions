def preprocess_input(text: str) -> str:
    if not isinstance(text, str) or not text.strip():
        raise ValueError("Empty or invalid text")

    # Normalize and clean up input
    text = text.strip()
    text = text.replace('\r\n', ' ').replace('\n', ' ')
    text = text.encode("utf-8", errors="ignore").decode("utf-8")

    return text