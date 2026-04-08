import os
import shutil
import uuid as uuid_mod

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, status
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.config import settings
from app.core.security import create_access_token, send_otp_sms, verify_otp

limiter = Limiter(key_func=get_remote_address)
from app.models.user import User
from app.schemas.auth import OTPSendRequest, OTPVerifyRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


class ProfileResponse(BaseModel):
    id: str
    phone: str
    name: str
    business_name: str | None = None
    city: str | None = None
    state: str | None = None
    mandi_name: str | None = None
    language: str = "hi"
    gst_number: str | None = None
    address: str | None = None
    logo_url: str | None = None
    upi_id: str | None = None
    role: str = "owner"
    plan: str = "free"

    model_config = {"from_attributes": True}


class FCMTokenUpdate(BaseModel):
    fcm_token: str


class ProfileUpdate(BaseModel):
    name: str | None = None
    business_name: str | None = None
    city: str | None = None
    state: str | None = None
    mandi_name: str | None = None
    language: str | None = None
    gst_number: str | None = None
    address: str | None = None
    upi_id: str | None = None


@router.post("/otp/send")
@limiter.limit("5/minute")
async def send_otp(request: Request, body: OTPSendRequest):
    otp = await send_otp_sms(body.phone)
    response = {"message": "OTP sent"}
    if settings.DEV_MODE:
        response["otp_dev"] = otp
    return response


@router.post("/otp/verify", response_model=TokenResponse)
@limiter.limit("10/minute")
async def verify_otp_endpoint(
    request: Request,
    body: OTPVerifyRequest,
    db: AsyncSession = Depends(get_db),
):
    if not verify_otp(body.phone, body.otp):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid OTP",
        )

    result = await db.execute(select(User).where(User.phone == body.phone))
    user = result.scalar_one_or_none()
    is_new = False

    if user is None:
        if not body.name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Name required for new user",
            )
        user = User(phone=body.phone, name=body.name)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        is_new = True

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user_id=str(user.id),
        is_new_user=is_new,
    )


def _build_profile_response(user: User) -> ProfileResponse:
    return ProfileResponse(
        id=str(user.id),
        phone=user.phone,
        name=user.name,
        business_name=user.business_name,
        city=user.city,
        state=user.state,
        mandi_name=user.mandi_name,
        language=user.language,
        gst_number=user.gst_number,
        address=user.address,
        logo_url=user.logo_url,
        upi_id=user.upi_id,
        role=user.role,
        plan=user.plan,
    )


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(user: User = Depends(get_current_user)):
    return _build_profile_response(user)


@router.put("/profile", response_model=ProfileResponse)
async def update_profile(
    body: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return _build_profile_response(user)


@router.post("/profile/fcm-token")
async def update_fcm_token(
    body: FCMTokenUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user.fcm_token = body.fcm_token
    await db.commit()
    return {"message": "FCM token updated"}


ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/profile/logo", response_model=ProfileResponse)
async def upload_logo(
    file: UploadFile,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, and WebP images are allowed",
        )

    ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "jpg"
    filename = f"{user.id}_{uuid_mod.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join("uploads", "logos", filename)

    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)

    user.logo_url = f"/uploads/logos/{filename}"
    await db.commit()
    await db.refresh(user)
    return _build_profile_response(user)


# ── Team Management (RBAC) ──


class TeamMemberCreate(BaseModel):
    phone: str
    name: str
    role: str = "manager"  # manager or viewer


class TeamMemberResponse(BaseModel):
    id: str
    phone: str
    name: str
    role: str
    created_at: str

    model_config = {"from_attributes": True}


@router.get("/team", response_model=list[TeamMemberResponse])
async def list_team_members(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.role != "owner":
        raise HTTPException(status_code=403, detail="Only owners can manage team")
    result = await db.execute(
        select(User).where(User.owner_id == user.id, User.is_active.is_(True))
    )
    members = result.scalars().all()
    return [
        TeamMemberResponse(
            id=str(m.id), phone=m.phone, name=m.name,
            role=m.role, created_at=str(m.created_at),
        )
        for m in members
    ]


@router.post("/team", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_team_member(
    body: TeamMemberCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.role != "owner":
        raise HTTPException(status_code=403, detail="Only owners can manage team")
    if body.role not in ("manager", "viewer"):
        raise HTTPException(status_code=400, detail="Role must be 'manager' or 'viewer'")

    # Check if phone already exists
    existing = await db.execute(select(User).where(User.phone == body.phone))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Phone number already registered")

    member = User(
        phone=body.phone,
        name=body.name,
        role=body.role,
        owner_id=user.id,
    )
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return TeamMemberResponse(
        id=str(member.id), phone=member.phone, name=member.name,
        role=member.role, created_at=str(member.created_at),
    )


@router.delete("/team/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_team_member(
    member_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.role != "owner":
        raise HTTPException(status_code=403, detail="Only owners can manage team")
    result = await db.execute(
        select(User).where(
            User.id == uuid_mod.UUID(member_id),
            User.owner_id == user.id,
        )
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    member.is_active = False
    await db.commit()
    from fastapi.responses import Response
    return Response(status_code=status.HTTP_204_NO_CONTENT)
