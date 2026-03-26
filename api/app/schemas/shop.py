from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ShopCreate(BaseModel):
    name: str = Field(..., max_length=200)
    description: str | None = None
    address: str = Field(..., max_length=500)
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)
    phone: str | None = Field(None, max_length=20)


class ShopUpdate(BaseModel):
    name: str | None = Field(None, max_length=200)
    description: str | None = None
    address: str | None = Field(None, max_length=500)
    lat: float | None = Field(None, ge=-90, le=90)
    lng: float | None = Field(None, ge=-180, le=180)
    phone: str | None = Field(None, max_length=20)
    is_active: bool | None = None


class ShopResponse(BaseModel):
    id: uuid.UUID
    owner_id: uuid.UUID
    name: str
    description: str | None = None
    address: str
    lat: float
    lng: float
    phone: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ShopListResponse(BaseModel):
    shops: list[ShopResponse]
    total: int
