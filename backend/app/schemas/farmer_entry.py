from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class FarmerEntryCreate(BaseModel):
    company_id: UUID | None = None
    invoice_no: str | None = None
    entry_date: date
    farmer_id: UUID
    village: str | None = None
    kharidar_id: UUID | None = None
    product_id: UUID
    weight: Decimal
    rate: Decimal
    amount: Decimal
    hamali: Decimal = Decimal("0")
    tawali: Decimal = Decimal("0")
    warai: Decimal = Decimal("0")
    auto_charge: Decimal = Decimal("0")
    kharcha: Decimal = Decimal("0")
    mobile_no: str | None = None


class FarmerEntryUpdate(BaseModel):
    company_id: UUID | None = None
    invoice_no: str | None = None
    entry_date: date | None = None
    farmer_id: UUID | None = None
    village: str | None = None
    kharidar_id: UUID | None = None
    product_id: UUID | None = None
    weight: Decimal | None = None
    rate: Decimal | None = None
    amount: Decimal | None = None
    hamali: Decimal | None = None
    tawali: Decimal | None = None
    warai: Decimal | None = None
    auto_charge: Decimal | None = None
    kharcha: Decimal | None = None
    mobile_no: str | None = None


class FarmerEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    company_id: UUID | None
    invoice_no: str | None
    entry_date: date
    farmer_id: UUID
    village: str | None
    kharidar_id: UUID | None
    product_id: UUID
    weight: Decimal
    rate: Decimal
    amount: Decimal
    hamali: Decimal
    tawali: Decimal
    warai: Decimal
    auto_charge: Decimal
    kharcha: Decimal
    mobile_no: str | None
    created_at: datetime
    updated_at: datetime
