from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter

from app.schemas.auth import AuthResponse, SendOTPRequest, VerifyOTPRequest
from app.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/send-otp")
async def send_otp(payload: SendOTPRequest) -> dict[str, str]:
    """Send an OTP to the given phone number.

    Stub: In production this triggers Firebase phone auth or an SMS provider.
    """
    # TODO: integrate real OTP sending
    return {"message": f"OTP sent to {payload.phone}", "status": "ok"}


@router.post("/verify-otp", response_model=AuthResponse)
async def verify_otp(payload: VerifyOTPRequest) -> AuthResponse:
    """Verify an OTP and return an access token + user.

    Stub: returns mock data for development.
    """
    # TODO: verify OTP with Firebase / SMS provider, create or fetch user
    now = datetime.now(timezone.utc)
    mock_user = UserResponse(
        id=uuid.uuid4(),
        phone=payload.phone,
        display_name=None,
        role="shopper",
        created_at=now,
        updated_at=now,
    )
    return AuthResponse(
        access_token="mock-jwt-token-replace-in-production",
        user=mock_user,
    )
