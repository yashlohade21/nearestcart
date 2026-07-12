from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ExpenseCreate(BaseModel):
    company_id: UUID | None = None
    expense_date: date
    category: str | None = None
    narration: str | None = None
    amount: Decimal
    payment_mode: str = "cash"
    bank_account_id: UUID | None = None
    cheque_no: str | None = None
    party_name: str | None = None
    farmer_bill_ref: str | None = None


class ExpenseUpdate(BaseModel):
    company_id: UUID | None = None
    expense_date: date | None = None
    category: str | None = None
    narration: str | None = None
    amount: Decimal | None = None
    payment_mode: str | None = None
    bank_account_id: UUID | None = None
    cheque_no: str | None = None
    party_name: str | None = None
    farmer_bill_ref: str | None = None


class ExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    company_id: UUID | None
    expense_date: date
    category: str | None
    narration: str | None
    amount: Decimal
    payment_mode: str
    bank_account_id: UUID | None
    cheque_no: str | None
    party_name: str | None
    farmer_bill_ref: str | None
    created_at: datetime
    updated_at: datetime
