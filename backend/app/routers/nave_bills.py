import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.nave_bill import NaveBill, NaveBillItem, NaveBillDetail
from app.models.user import User

router = APIRouter(prefix="/nave-bills", tags=["nave-bills"])


# ---------------------------------------------------------------------------
# Inline Pydantic schemas (no separate schema file exists for nave_bill)
# ---------------------------------------------------------------------------

class NaveBillItemCreate(BaseModel):
    product_id: uuid.UUID | None = None
    kharidar_name: str
    pauti_no: str | None = None
    weight: Decimal
    rate: Decimal
    amount: Decimal


class NaveBillItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    nave_bill_id: uuid.UUID
    product_id: uuid.UUID | None
    kharidar_name: str
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

    id: uuid.UUID
    nave_bill_id: uuid.UUID
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
    company_id: uuid.UUID | None = None
    buyer_id: uuid.UUID
    bill_no: str
    bill_date: date
    total_amount: Decimal = Decimal("0")
    total_deductions: Decimal = Decimal("0")
    net_amount: Decimal = Decimal("0")
    status: str = "draft"
    items: List[NaveBillItemCreate] = []
    details: NaveBillDetailCreate | None = None


class NaveBillUpdate(BaseModel):
    company_id: uuid.UUID | None = None
    buyer_id: uuid.UUID | None = None
    bill_no: str | None = None
    bill_date: date | None = None
    total_amount: Decimal | None = None
    total_deductions: Decimal | None = None
    net_amount: Decimal | None = None
    status: str | None = None


class NaveBillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    company_id: uuid.UUID | None
    buyer_id: uuid.UUID
    bill_no: str
    bill_date: date
    total_amount: Decimal
    total_deductions: Decimal
    net_amount: Decimal
    status: str
    created_at: datetime
    updated_at: datetime
    items: List[NaveBillItemResponse] = []
    details: NaveBillDetailResponse | None = None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/", response_model=list[NaveBillResponse])
async def list_nave_bills(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    search: str = Query("", description="Search by bill number"),
    company_id: uuid.UUID | None = Query(None),
    buyer_id: uuid.UUID | None = Query(None),
    status: str | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    load_options = [selectinload(NaveBill.items), selectinload(NaveBill.details)]
    q = (
        select(NaveBill)
        .options(*load_options)
        .where(NaveBill.user_id == user.id)
    )
    if search:
        q = q.where(NaveBill.bill_no.ilike(f"%{search}%"))
    if company_id:
        q = q.where(NaveBill.company_id == company_id)
    if buyer_id:
        q = q.where(NaveBill.buyer_id == buyer_id)
    if status:
        q = q.where(NaveBill.status == status)
    q = q.order_by(NaveBill.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{item_id}", response_model=NaveBillResponse)
async def get_nave_bill(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    load_options = [selectinload(NaveBill.items), selectinload(NaveBill.details)]
    result = await db.execute(
        select(NaveBill)
        .options(*load_options)
        .where(NaveBill.id == item_id, NaveBill.user_id == user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    return item


@router.post("/", response_model=NaveBillResponse, status_code=201)
async def create_nave_bill(
    data: NaveBillCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    bill_data = data.model_dump(exclude={"items", "details"})
    bill = NaveBill(user_id=user.id, **bill_data)
    db.add(bill)
    await db.flush()

    for item_data in data.items:
        bill_item = NaveBillItem(nave_bill_id=bill.id, **item_data.model_dump())
        db.add(bill_item)

    if data.details is not None:
        detail = NaveBillDetail(nave_bill_id=bill.id, **data.details.model_dump())
        db.add(detail)

    await db.commit()
    await db.refresh(bill)
    load_options = [selectinload(NaveBill.items), selectinload(NaveBill.details)]
    result = await db.execute(
        select(NaveBill)
        .options(*load_options)
        .where(NaveBill.id == bill.id)
    )
    return result.scalar_one()


@router.patch("/{item_id}", response_model=NaveBillResponse)
async def update_nave_bill(
    item_id: uuid.UUID,
    data: NaveBillUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    load_options = [selectinload(NaveBill.items), selectinload(NaveBill.details)]
    result = await db.execute(
        select(NaveBill)
        .options(*load_options)
        .where(NaveBill.id == item_id, NaveBill.user_id == user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    await db.commit()
    await db.refresh(item)
    result2 = await db.execute(
        select(NaveBill)
        .options(*load_options)
        .where(NaveBill.id == item_id)
    )
    return result2.scalar_one()


@router.delete("/{item_id}", status_code=204)
async def delete_nave_bill(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(NaveBill).where(NaveBill.id == item_id, NaveBill.user_id == user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    await db.delete(item)
    await db.commit()
