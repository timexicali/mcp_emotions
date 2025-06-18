import re
from typing import Tuple, List

def validate_password(password: str) -> Tuple[bool, List[str]]:
    """
    Validate password against strict rules.
    
    Rules:
    - Minimum 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 number
    - At least 1 special character
    
    Returns:
        Tuple[bool, List[str]]: (is_valid, list_of_errors)
    """
    errors = []
    
    # Check minimum length
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    
    # Check for uppercase letter
    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least 1 uppercase letter")
    
    # Check for lowercase letter
    if not re.search(r'[a-z]', password):
        errors.append("Password must contain at least 1 lowercase letter")
    
    # Check for number
    if not re.search(r'\d', password):
        errors.append("Password must contain at least 1 number")
    
    # Check for special character
    if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', password):
        errors.append("Password must contain at least 1 special character")
    
    return len(errors) == 0, errors

def get_password_requirements() -> str:
    """Get a human-readable description of password requirements."""
    return (
        "Password must meet the following requirements:\n"
        "• Minimum 8 characters\n"
        "• At least 1 uppercase letter (A-Z)\n"
        "• At least 1 lowercase letter (a-z)\n"
        "• At least 1 number (0-9)\n"
        "• At least 1 special character (!@#$%^&*()_+-=[]{}|;:,.<>?)"
    ) 