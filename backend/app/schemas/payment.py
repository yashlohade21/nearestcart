import uuid
from datetime import date, datetime

from pydantic import BaseModel


class PaymentCreate(BaseModel):
    deal_id: uuid.UUID | None = None
    advance_id: uuid.UUID | None = None
    direction: str  # 'incoming' or 'outgoing'
    farmer_id: uuid.UUID | None = None
    buyer_id: uuid.UUID | None = None
    amount: float
    payment_mode: str | None = None
    reference_no: str | None = None
    payment_date: date | None = None
    notes: str | None = None


class PaymentResponse(BaseModel):
    id: uuid.UUID
    deal_id: uuid.UUID | None
    advance_id: uuid.UUID | None
    direction: str
    farmer_id: uuid.UUID | None
    buyer_id: uuid.UUID | None
    amount: float
    payment_mode: str | None
    reference_no: str | None
    payment_date: date
    notes: str | None
    created_at: datetime

    # Populated in router
    party_name: str | None = None

    model_config = {"from_attributes": True}


class PendingPaymentSummary(BaseModel):
    party_id: uuid.UUID
    party_name: str
    party_phone: str | None
    pending_amount: float
    pending_deals: int
    oldest_deal_date: date | None
    max_overdue_days: int | None
