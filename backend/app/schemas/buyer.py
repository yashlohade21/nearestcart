import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class BuyerCreate(BaseModel):
    name: str
    contact_person: str | None = None
    phone: str | None = None
    company_type: str | None = None
    city: str | None = None
    state: str | None = None
    gst_number: str | None = None
    notes: str | None = None


class BuyerUpdate(BaseModel):
    name: str | None = None
    contact_person: str | None = None
    phone: str | None = None
    company_type: str | None = None
    city: str | None = None
    state: str | None = None
    gst_number: str | None = None
    notes: str | None = None
    is_active: bool | None = None


class BuyerResponse(BaseModel):
    id: uuid.UUID
    name: str
    contact_person: str | None
    phone: str | None
    company_type: str | None
    city: str | None
    state: str | None
    gst_number: str | None
    avg_payment_days: float | None
    dispute_rate: float | None
    payment_rating: float | None
    total_deals: int
    total_volume_kg: float
    total_business_amt: float
    notes: str | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class BuyerDetailResponse(BuyerResponse):
    total_sell_amount: float
    total_received_amount: float
    outstanding_balance: float
    deals: list[dict[str, Any]]
    payments: list[dict[str, Any]]
