from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class PurchaseEntryCreate(BaseModel):
    company_id: UUID | None = None
    bill_no: str | None = None
    p_date: date
    supplier_id: UUID
    vehicle_no: str | None = None
    product_id: UUID
    agent_id: UUID | None = None
    quantity: Decimal
    rate: Decimal
    gross_amount: Decimal
    transport_cost: Decimal = Decimal("0")
    loading_cost: Decimal = Decimal("0")
    unloading_cost: Decimal = Decimal("0")
    advance: Decimal = Decimal("0")
    net_amount: Decimal
    commission_deduction: Decimal = Decimal("0")
    branch: str | None = None
    notes: str | None = None


class PurchaseEntryUpdate(BaseModel):
    company_id: UUID | None = None
    bill_no: str | None = None
    p_date: date | None = None
    supplier_id: UUID | None = None
    vehicle_no: str | None = None
    product_id: UUID | None = None
    agent_id: UUID | None = None
    quantity: Decimal | None = None
    rate: Decimal | None = None
    gross_amount: Decimal | None = None
    transport_cost: Decimal | None = None
    loading_cost: Decimal | None = None
    unloading_cost: Decimal | None = None
    advance: Decimal | None = None
    net_amount: Decimal | None = None
    commission_deduction: Decimal | None = None
    branch: str | None = None
    notes: str | None = None


class PurchaseEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    company_id: UUID | None
    bill_no: str | None
    p_date: date
    supplier_id: UUID
    vehicle_no: str | None
    product_id: UUID
    agent_id: UUID | None
    quantity: Decimal
    rate: Decimal
    gross_amount: Decimal
    transport_cost: Decimal
    loading_cost: Decimal
    unloading_cost: Decimal
    advance: Decimal
    net_amount: Decimal
    commission_deduction: Decimal
    branch: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime
