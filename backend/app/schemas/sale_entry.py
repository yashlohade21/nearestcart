from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class SaleEntryCreate(BaseModel):
    company_id: UUID | None = None
    invoice_no: str | None = None
    sale_date: date
    buyer_id: UUID
    product_id: UUID
    quantity: Decimal
    rate: Decimal
    gross_amount: Decimal
    transport_cost: Decimal = Decimal("0")
    lr_no: str | None = None
    driver_name: str | None = None
    vehicle_no: str | None = None
    owner_name: str | None = None
    hsn_code: str | None = None
    tcs_amount: Decimal = Decimal("0")
    add_topay: Decimal = Decimal("0")
    less_topay: Decimal = Decimal("0")
    net_amount: Decimal
    po_no: str | None = None
    branch: str | None = None


class SaleEntryUpdate(BaseModel):
    company_id: UUID | None = None
    invoice_no: str | None = None
    sale_date: date | None = None
    buyer_id: UUID | None = None
    product_id: UUID | None = None
    quantity: Decimal | None = None
    rate: Decimal | None = None
    gross_amount: Decimal | None = None
    transport_cost: Decimal | None = None
    lr_no: str | None = None
    driver_name: str | None = None
    vehicle_no: str | None = None
    owner_name: str | None = None
    hsn_code: str | None = None
    tcs_amount: Decimal | None = None
    add_topay: Decimal | None = None
    less_topay: Decimal | None = None
    net_amount: Decimal | None = None
    po_no: str | None = None
    branch: str | None = None


class SaleEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    company_id: UUID | None
    invoice_no: str | None
    sale_date: date
    buyer_id: UUID
    product_id: UUID
    quantity: Decimal
    rate: Decimal
    gross_amount: Decimal
    transport_cost: Decimal
    lr_no: str | None
    driver_name: str | None
    vehicle_no: str | None
    owner_name: str | None
    hsn_code: str | None
    tcs_amount: Decimal
    add_topay: Decimal
    less_topay: Decimal
    net_amount: Decimal
    po_no: str | None
    branch: str | None
    created_at: datetime
    updated_at: datetime
