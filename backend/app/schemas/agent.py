import uuid
from datetime import datetime

from pydantic import BaseModel


class AgentCreate(BaseModel):
    name: str
    phone: str | None = None
    email: str | None = None
    pan_number: str | None = None
    commission_rate: float | None = None
    city: str | None = None
    state: str | None = None
    address: str | None = None
    branch: str | None = None
    notes: str | None = None


class AgentUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    pan_number: str | None = None
    commission_rate: float | None = None
    city: str | None = None
    state: str | None = None
    address: str | None = None
    branch: str | None = None
    notes: str | None = None
    is_active: bool | None = None


class AgentResponse(BaseModel):
    id: uuid.UUID
    name: str
    phone: str | None
    email: str | None
    pan_number: str | None
    commission_rate: float | None
    city: str | None
    state: str | None
    address: str | None
    branch: str | None
    total_commission_earned: float
    total_commission_paid: float
    notes: str | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
