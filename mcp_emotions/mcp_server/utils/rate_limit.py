import ipaddress
from typing import Optional
from fastapi import Request
from core.config import get_settings
from models.user import User

settings = get_settings()

def is_ip_whitelisted(ip: str) -> bool:
    """Check if an IP address is in the whitelist."""
    try:
        client_ip = ipaddress.ip_address(ip)
        for whitelist_ip in settings.RATE_LIMIT_WHITELIST_IPS:
            try:
                if "/" in whitelist_ip:  # CIDR notation
                    network = ipaddress.ip_network(whitelist_ip, strict=False)
                    if client_ip in network:
                        return True
                else:  # Single IP
                    if client_ip == ipaddress.ip_address(whitelist_ip):
                        return True
            except ValueError:
                continue
        return False
    except ValueError:
        return False

def is_internal_role(user: Optional[User]) -> bool:
    """Check if a user has an internal role."""
    if not user:
        return False
    return user.role in settings.RATE_LIMIT_INTERNAL_ROLES

def should_rate_limit(request: Request, user: Optional[User] = None) -> bool:
    """
    Determine if a request should be rate limited.
    Returns False if the request should be excluded from rate limiting.
    """
    # Get client IP
    client_ip = request.client.host if request.client else None
    if not client_ip:
        return True  # Rate limit if we can't determine the IP
    
    # Check if IP is whitelisted
    if is_ip_whitelisted(client_ip):
        return False
    
    # Check if user has internal role
    if user and is_internal_role(user):
        return False
    
    return True 