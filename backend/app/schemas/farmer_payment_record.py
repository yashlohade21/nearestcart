from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class FarmerPaymentRecordCreate(BaseModel):
    company_id: UUID | None = None
    farmer_id: UUID
    payment_date: date
    amount: Decimal
    cash_amount: Decimal = Decimal("0")
    bank_name: str | None = None
    cheque_no: str | None = None
    narration: str | None = None


class FarmerPaymentRecordUpdate(BaseModel):
    company_id: UUID | None = None
    farmer_id: UUID | None = None
    payment_date: date | None = None
    amount: Decimal | None = None
    cash_amount: Decimal | None = None
    bank_name: str | None = None
    cheque_no: str | None = None
    narration: str | None = None


class FarmerPaymentRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    company_id: UUID | None
    farmer_id: UUID
    payment_date: date
    amount: Decimal
    cash_amount: Decimal
    bank_name: str | None
    cheque_no: str | None
    narration: str | None
    created_at: datetime
    updated_at: datetime
