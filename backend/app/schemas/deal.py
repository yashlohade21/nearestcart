import uuid
from datetime import date, datetime

from pydantic import BaseModel, computed_field


class DealCreate(BaseModel):
    farmer_id: uuid.UUID
    buyer_id: uuid.UUID
    product_id: uuid.UUID
    quantity: float
    unit: str = "kg"
    buy_rate: float
    sell_rate: float
    transport_cost: float = 0
    labour_cost: float = 0
    other_cost: float = 0
    transporter_id: uuid.UUID | None = None
    deal_date: date | None = None
    delivery_date: date | None = None
    payment_due_date: date | None = None
    quality_grade: str | None = None
    notes: str | None = None


class DealUpdate(BaseModel):
    farmer_id: uuid.UUID | None = None
    buyer_id: uuid.UUID | None = None
    product_id: uuid.UUID | None = None
    quantity: float | None = None
    unit: str | None = None
    buy_rate: float | None = None
    sell_rate: float | None = None
    transport_cost: float | None = None
    labour_cost: float | None = None
    other_cost: float | None = None
    deal_date: date | None = None
    payment_due_date: date | None = None
    quality_grade: str | None = None
    transporter_id: uuid.UUID | None = None
    status: str | None = None
    farmer_payment_status: str | None = None
    buyer_payment_status: str | None = None
    farmer_paid_amount: float | None = None
    buyer_received_amount: float | None = None
    spoilage_qty: float | None = None
    spoilage_reason: str | None = None
    delivery_date: date | None = None
    has_dispute: bool | None = None
    dispute_notes: str | None = None
    notes: str | None = None


class DealResponse(BaseModel):
    id: uuid.UUID
    farmer_id: uuid.UUID
    buyer_id: uuid.UUID
    product_id: uuid.UUID
    quantity: float
    unit: str
    buy_rate: float
    sell_rate: float
    transport_cost: float
    labour_cost: float
    other_cost: float
    status: str
    farmer_payment_status: str
    buyer_payment_status: str
    farmer_paid_amount: float
    buyer_received_amount: float
    spoilage_qty: float
    spoilage_reason: str | None
    transporter_id: uuid.UUID | None
    deal_date: date
    delivery_date: date | None
    payment_due_date: date | None
    quality_grade: str | None
    has_dispute: bool
    dispute_notes: str | None
    notes: str | None
    created_at: datetime

    # Related names (populated in router)
    farmer_name: str | None = None
    buyer_name: str | None = None
    product_name: str | None = None

    @computed_field
    @property
    def buy_total(self) -> float:
        return self.quantity * self.buy_rate

    @computed_field
    @property
    def sell_total(self) -> float:
        return self.quantity * self.sell_rate

    @computed_field
    @property
    def gross_margin(self) -> float:
        return self.sell_total - self.buy_total

    @computed_field
    @property
    def total_cost(self) -> float:
        return self.transport_cost + self.labour_cost + self.other_cost

    @computed_field
    @property
    def net_profit(self) -> float:
        return self.gross_margin - self.total_cost

    model_config = {"from_attributes": True}
