from __future__ import annotations

from pydantic import BaseModel, Field

from app.schemas.user import UserResponse


class SendOTPRequest(BaseModel):
    phone: str = Field(..., description="Phone number in E.164 format, e.g. +919876543210")


class VerifyOTPRequest(BaseModel):
    phone: str = Field(..., description="Phone number in E.164 format")
    otp_code: str = Field(..., min_length=4, max_length=6, description="OTP code received via SMS")


class AuthResponse(BaseModel):
    access_token: str
    user: UserResponse
