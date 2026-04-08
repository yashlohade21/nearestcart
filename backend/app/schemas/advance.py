import uuid
from datetime import date, datetime

from pydantic import BaseModel, computed_field


class AdvanceCreate(BaseModel):
    farmer_id: uuid.UUID
    amount: float
    purpose: str | None = None
    given_date: date | None = None
    expected_recovery_date: date | None = None
    notes: str | None = None


class AdvanceUpdate(BaseModel):
    recovered: float | None = None
    status: str | None = None
    expected_recovery_date: date | None = None
    notes: str | None = None


class AdvanceResponse(BaseModel):
    id: uuid.UUID
    farmer_id: uuid.UUID
    amount: float
    recovered: float
    purpose: str | None
    given_date: date
    expected_recovery_date: date | None
    status: str
    notes: str | None
    created_at: datetime

    farmer_name: str | None = None

    @computed_field
    @property
    def balance(self) -> float:
        return self.amount - self.recovered

    model_config = {"from_attributes": True}
