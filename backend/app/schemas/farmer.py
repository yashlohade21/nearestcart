import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class FarmerCreate(BaseModel):
    name: str
    phone: str | None = None
    email: str | None = None
    village: str | None = None
    district: str | None = None
    state: str | None = None
    address: str | None = None
    pan_number: str | None = None
    opening_balance: float | None = 0
    credit_days: int | None = 0
    primary_crops: list[str] | None = None
    gaon: str | None = None
    taluka: str | None = None
    bank_name: str | None = None
    account_no: str | None = None
    ifsc_code: str | None = None
    farmer_bank_branch: str | None = None
    notes: str | None = None


class FarmerUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    village: str | None = None
    district: str | None = None
    state: str | None = None
    address: str | None = None
    pan_number: str | None = None
    opening_balance: float | None = None
    credit_days: int | None = None
    primary_crops: list[str] | None = None
    gaon: str | None = None
    taluka: str | None = None
    bank_name: str | None = None
    account_no: str | None = None
    ifsc_code: str | None = None
    farmer_bank_branch: str | None = None
    notes: str | None = None
    is_active: bool | None = None


class FarmerResponse(BaseModel):
    id: uuid.UUID
    name: str
    phone: str | None
    email: str | None
    village: str | None
    district: str | None
    state: str | None
    address: str | None
    pan_number: str | None
    opening_balance: float | None
    credit_days: int | None
    primary_crops: list[str] | None
    quality_rating: float | None
    reliability: float | None
    total_deals: int
    total_volume_kg: float
    gaon: str | None
    taluka: str | None
    bank_name: str | None
    account_no: str | None
    ifsc_code: str | None
    farmer_bank_branch: str | None
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
