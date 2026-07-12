from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class NaveBillItemCreate(BaseModel):
    product_id: UUID | None = None
    kharidar_name: str | None = None
    pauti_no: str | None = None
    weight: Decimal
    rate: Decimal
    amount: Decimal


class NaveBillItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    nave_bill_id: UUID
    product_id: UUID | None
    kharidar_name: str | None
    pauti_no: str | None
    weight: Decimal
    rate: Decimal
    amount: Decimal
    created_at: datetime
    updated_at: datetime


class NaveBillDetailCreate(BaseModel):
    market_fees: Decimal = Decimal("0")
    supervision: Decimal = Decimal("0")
    adat: Decimal = Decimal("0")
    bardan: Decimal = Decimal("0")
    labour: Decimal = Decimal("0")
    gadi_bhada: Decimal = Decimal("0")
    sutli: Decimal = Decimal("0")
    weight_short: Decimal = Decimal("0")


class NaveBillDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    nave_bill_id: UUID
    market_fees: Decimal
    supervision: Decimal
    adat: Decimal
    bardan: Decimal
    labour: Decimal
    gadi_bhada: Decimal
    sutli: Decimal
    weight_short: Decimal
    created_at: datetime
    updated_at: datetime


class NaveBillCreate(BaseModel):
    company_id: UUID | None = None
    bill_no: str | None = None
    bill_date: date
    buyer_id: UUID
    total_amount: Decimal = Decimal("0")
    total_deductions: Decimal = Decimal("0")
    net_amount: Decimal = Decimal("0")
    status: str = "draft"
    items: list[NaveBillItemCreate] = []
    details: NaveBillDetailCreate | None = None


class NaveBillUpdate(BaseModel):
    company_id: UUID | None = None
    bill_no: str | None = None
    bill_date: date | None = None
    buyer_id: UUID | None = None
    total_amount: Decimal | None = None
    total_deductions: Decimal | None = None
    net_amount: Decimal | None = None
    status: str | None = None


class NaveBillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    company_id: UUID | None
    bill_no: str | None
    bill_date: date
    buyer_id: UUID
    total_amount: Decimal
    total_deductions: Decimal
    net_amount: Decimal
    status: str
    items: list[NaveBillItemResponse] = []
    details: NaveBillDetailResponse | None = None
    created_at: datetime
    updated_at: datetime
