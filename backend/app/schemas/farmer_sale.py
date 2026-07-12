from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class FarmerSaleCreate(BaseModel):
    company_id: UUID | None = None
    farmer_entry_id: UUID
    market_fees: Decimal = Decimal("0")
    supervision: Decimal = Decimal("0")
    adat_commission: Decimal = Decimal("0")
    bardan: Decimal = Decimal("0")
    labour: Decimal = Decimal("0")
    sutli: Decimal = Decimal("0")
    gadi_bhada: Decimal = Decimal("0")
    weight_short: Decimal = Decimal("0")
    total_deductions: Decimal = Decimal("0")
    net_payable: Decimal = Decimal("0")


class FarmerSaleUpdate(BaseModel):
    company_id: UUID | None = None
    farmer_entry_id: UUID | None = None
    market_fees: Decimal | None = None
    supervision: Decimal | None = None
    adat_commission: Decimal | None = None
    bardan: Decimal | None = None
    labour: Decimal | None = None
    sutli: Decimal | None = None
    gadi_bhada: Decimal | None = None
    weight_short: Decimal | None = None
    total_deductions: Decimal | None = None
    net_payable: Decimal | None = None


class FarmerSaleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    company_id: UUID | None
    farmer_entry_id: UUID
    market_fees: Decimal
    supervision: Decimal
    adat_commission: Decimal
    bardan: Decimal
    labour: Decimal
    sutli: Decimal
    gadi_bhada: Decimal
    weight_short: Decimal
    total_deductions: Decimal
    net_payable: Decimal
    created_at: datetime
    updated_at: datetime
