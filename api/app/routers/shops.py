from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter

from app.schemas.shop import ShopCreate, ShopResponse, ShopUpdate

router = APIRouter(prefix="/shops", tags=["shops"])


@router.post("/", response_model=ShopResponse, status_code=201)
async def create_shop(payload: ShopCreate) -> ShopResponse:
    """Create a new shop.

    Stub: returns mock data. In production, persists to the database.
    """
    now = datetime.now(timezone.utc)
    return ShopResponse(
        id=uuid.uuid4(),
        owner_id=uuid.uuid4(),
        name=payload.name,
        description=payload.description,
        address=payload.address,
        lat=payload.lat,
        lng=payload.lng,
        phone=payload.phone,
        is_active=True,
        created_at=now,
        updated_at=now,
    )


@router.get("/{shop_id}", response_model=ShopResponse)
async def get_shop(shop_id: uuid.UUID) -> ShopResponse:
    """Get a shop by ID.

    Stub: returns mock data.
    """
    now = datetime.now(timezone.utc)
    return ShopResponse(
        id=shop_id,
        owner_id=uuid.uuid4(),
        name="Mock Shop",
        description="A placeholder shop for development",
        address="123 Main St",
        lat=12.9716,
        lng=77.5946,
        phone="+910000000000",
        is_active=True,
        created_at=now,
        updated_at=now,
    )


@router.put("/{shop_id}", response_model=ShopResponse)
async def update_shop(shop_id: uuid.UUID, payload: ShopUpdate) -> ShopResponse:
    """Update a shop by ID.

    Stub: returns mock data reflecting the update.
    """
    now = datetime.now(timezone.utc)
    return ShopResponse(
        id=shop_id,
        owner_id=uuid.uuid4(),
        name=payload.name or "Mock Shop",
        description=payload.description,
        address=payload.address or "123 Main St",
        lat=payload.lat or 12.9716,
        lng=payload.lng or 77.5946,
        phone=payload.phone,
        is_active=payload.is_active if payload.is_active is not None else True,
        created_at=now,
        updated_at=now,
    )
