from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class PurchasePaymentCreate(BaseModel):
    company_id: UUID | None = None
    supplier_id: UUID
    payment_date: date
    bill_no: str | None = None
    total: Decimal
    paid: Decimal
    balance: Decimal
    bank_name: str | None = None
    cheque_no: str | None = None
    payment_mode: str = "cash"
    narration: str | None = None


class PurchasePaymentUpdate(BaseModel):
    company_id: UUID | None = None
    supplier_id: UUID | None = None
    payment_date: date | None = None
    bill_no: str | None = None
    total: Decimal | None = None
    paid: Decimal | None = None
    balance: Decimal | None = None
    bank_name: str | None = None
    cheque_no: str | None = None
    payment_mode: str | None = None
    narration: str | None = None


class PurchasePaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    company_id: UUID | None
    supplier_id: UUID
    payment_date: date
    bill_no: str | None
    total: Decimal
    paid: Decimal
    balance: Decimal
    bank_name: str | None
    cheque_no: str | None
    payment_mode: str
    narration: str | None
    created_at: datetime
    updated_at: datetime
