from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CashEntryCreate(BaseModel):
    company_id: UUID | None = None
    entry_date: date
    type: str
    narration: str | None = None
    amount: Decimal
    party_name: str | None = None
    party_type: str | None = None
    reference_no: str | None = None
    branch: str | None = None


class CashEntryUpdate(BaseModel):
    company_id: UUID | None = None
    entry_date: date | None = None
    type: str | None = None
    narration: str | None = None
    amount: Decimal | None = None
    party_name: str | None = None
    party_type: str | None = None
    reference_no: str | None = None
    branch: str | None = None


class CashEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    company_id: UUID | None
    entry_date: date
    type: str
    narration: str | None
    amount: Decimal
    party_name: str | None
    party_type: str | None
    reference_no: str | None
    branch: str | None
    created_at: datetime
    updated_at: datetime
