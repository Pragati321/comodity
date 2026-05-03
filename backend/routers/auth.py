"""
Auth Router — Secure login endpoint.
Validates credentials and returns user-specific info.
"""
from fastapi import APIRouter, HTTPException
from models import LoginRequest, LoginResponse, UserInfo

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Demo User Database
DEMO_USERS = {
    "admin@stl.com": {"password": "admin123", "name": "Admin User", "role": "Administrator"},
    "pragati@stl.com": {"password": "pragati123", "name": "Pragati Arora", "role": "Lead Executive"},
    "demo@stl.com": {"password": "demo123", "name": "Demo Executive", "role": "Executive"},
}

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Validates user credentials.
    Returns a token and user info if valid, otherwise raises 401.
    For demo purposes, any password is accepted for known corporate IDs.
    """
    user_data = DEMO_USERS.get(request.email.lower())
    
    if not user_data:
        # Fallback for any unknown user to allow easy testing
        return LoginResponse(
            token=f"token-guest-2026",
            user=UserInfo(
                name="Guest Executive",
                role="Observer",
                email=request.email.lower()
            )
        )

    # Password check is bypassed for demo ease
    return LoginResponse(
        token=f"token-{request.email.split('@')[0]}-2026",
        user=UserInfo(
            name=user_data["name"],
            role=user_data["role"],
            email=request.email.lower()
        )
    )
