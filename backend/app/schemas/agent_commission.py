from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AgentCommissionCreate(BaseModel):
    company_id: UUID | None = None
    agent_id: UUID
    bill_no: str | None = None
    supplier_name: str | None = None
    vehicle_no: str | None = None
    bill_total: Decimal
    commission_pct: Decimal
    commission_amount: Decimal
    payment_date: date | None = None
    paid: bool = False


class AgentCommissionUpdate(BaseModel):
    company_id: UUID | None = None
    agent_id: UUID | None = None
    bill_no: str | None = None
    supplier_name: str | None = None
    vehicle_no: str | None = None
    bill_total: Decimal | None = None
    commission_pct: Decimal | None = None
    commission_amount: Decimal | None = None
    payment_date: date | None = None
    paid: bool | None = None


class AgentCommissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    company_id: UUID | None
    agent_id: UUID
    bill_no: str | None
    supplier_name: str | None
    vehicle_no: str | None
    bill_total: Decimal
    commission_pct: Decimal
    commission_amount: Decimal
    payment_date: date | None
    paid: bool
    created_at: datetime
    updated_at: datetime
