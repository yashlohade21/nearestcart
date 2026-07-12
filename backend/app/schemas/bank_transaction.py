from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class BankTransactionCreate(BaseModel):
    company_id: UUID | None = None
    bank_account_id: UUID
    txn_date: date
    type: str
    amount: Decimal
    party_name: str | None = None
    cheque_no: str | None = None
    cheque_date: date | None = None
    narration: str | None = None
    reconciled: bool = False


class BankTransactionUpdate(BaseModel):
    company_id: UUID | None = None
    bank_account_id: UUID | None = None
    txn_date: date | None = None
    type: str | None = None
    amount: Decimal | None = None
    party_name: str | None = None
    cheque_no: str | None = None
    cheque_date: date | None = None
    narration: str | None = None
    reconciled: bool | None = None


class BankTransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    company_id: UUID | None
    bank_account_id: UUID
    txn_date: date
    type: str
    amount: Decimal
    party_name: str | None
    cheque_no: str | None
    cheque_date: date | None
    narration: str | None
    reconciled: bool
    created_at: datetime
    updated_at: datetime
