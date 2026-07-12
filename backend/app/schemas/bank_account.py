import uuid
from datetime import datetime

from pydantic import BaseModel


class BankAccountCreate(BaseModel):
    bank_name: str
    account_holder_name: str | None = None
    account_no: str | None = None
    account_type: str | None = "current"
    ifsc_code: str | None = None
    branch: str | None = None
    opening_balance: float | None = 0
    notes: str | None = None


class BankAccountUpdate(BaseModel):
    bank_name: str | None = None
    account_holder_name: str | None = None
    account_no: str | None = None
    account_type: str | None = None
    ifsc_code: str | None = None
    branch: str | None = None
    opening_balance: float | None = None
    current_balance: float | None = None
    notes: str | None = None
    is_active: bool | None = None


class BankAccountResponse(BaseModel):
    id: uuid.UUID
    bank_name: str
    account_holder_name: str | None
    account_no: str | None
    account_type: str | None
    ifsc_code: str | None
    branch: str | None
    opening_balance: float | None
    current_balance: float | None
    notes: str | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
