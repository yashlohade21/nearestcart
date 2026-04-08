import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class FarmerCreate(BaseModel):
    name: str
    phone: str | None = None
    village: str | None = None
    district: str | None = None
    state: str | None = None
    primary_crops: list[str] | None = None
    notes: str | None = None


class FarmerUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    village: str | None = None
    district: str | None = None
    state: str | None = None
    primary_crops: list[str] | None = None
    notes: str | None = None
    is_active: bool | None = None


class FarmerResponse(BaseModel):
    id: uuid.UUID
    name: str
    phone: str | None
    village: str | None
    district: str | None
    state: str | None
    primary_crops: list[str] | None
    quality_rating: float | None
    reliability: float | None
    total_deals: int
    total_volume_kg: float
    notes: str | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class FarmerDetailResponse(FarmerResponse):
    total_buy_amount: float
    total_paid_amount: float
    outstanding_balance: float
    deals: list[dict[str, Any]]
    payments: list[dict[str, Any]]
