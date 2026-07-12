from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class StockLedgerCreate(BaseModel):
    company_id: UUID | None = None
    product_id: UUID
    txn_date: date
    txn_type: str
    quantity: Decimal
    reference_id: UUID | None = None
    reference_type: str | None = None
    balance_after: Decimal


class StockLedgerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    company_id: UUID | None
    product_id: UUID
    txn_date: date
    txn_type: str
    quantity: Decimal
    reference_id: UUID | None
    reference_type: str | None
    balance_after: Decimal
    created_at: datetime
    updated_at: datetime
