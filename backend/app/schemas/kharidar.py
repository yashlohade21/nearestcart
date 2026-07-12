from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class KharidarCreate(BaseModel):
    company_id: UUID | None = None
    name: str
    phone: str | None = None
    address: str | None = None
    is_active: bool = True


class KharidarUpdate(BaseModel):
    company_id: UUID | None = None
    name: str | None = None
    phone: str | None = None
    address: str | None = None
    is_active: bool | None = None


class KharidarResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    company_id: UUID | None
    name: str
    phone: str | None
    address: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime
