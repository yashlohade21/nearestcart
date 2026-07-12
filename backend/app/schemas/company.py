from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CompanyCreate(BaseModel):
    name: str
    address: str | None = None
    gst_no: str | None = None
    pan_no: str | None = None
    logo_url: str | None = None
    is_default: bool = False
    phone: str | None = None
    email: str | None = None
    bank_name: str | None = None
    account_no: str | None = None
    ifsc_code: str | None = None
    branch: str | None = None


class CompanyUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    gst_no: str | None = None
    pan_no: str | None = None
    logo_url: str | None = None
    is_default: bool | None = None
    phone: str | None = None
    email: str | None = None
    bank_name: str | None = None
    account_no: str | None = None
    ifsc_code: str | None = None
    branch: str | None = None


class CompanyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    name: str
    address: str | None
    gst_no: str | None
    pan_no: str | None
    logo_url: str | None
    is_default: bool
    phone: str | None
    email: str | None
    bank_name: str | None
    account_no: str | None
    ifsc_code: str | None
    branch: str | None
    created_at: datetime
    updated_at: datetime
