import uuid
from datetime import date, datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.agent_commission import AgentCommission
from app.models.user import User

router = APIRouter(prefix="/agent-commissions", tags=["agent-commissions"])


# ---------------------------------------------------------------------------
# Inline Pydantic schemas (no separate schema file exists for agent_commission)
# ---------------------------------------------------------------------------

class AgentCommissionCreate(BaseModel):
    company_id: uuid.UUID | None = None
    agent_id: uuid.UUID
    bill_no: str | None = None
    supplier_name: str | None = None
    vehicle_no: str | None = None
    bill_total: Decimal
    commission_pct: Decimal
    commission_amount: Decimal
    payment_date: date | None = None
    paid: bool = False


class AgentCommissionUpdate(BaseModel):
    company_id: uuid.UUID | None = None
    agent_id: uuid.UUID | None = None
    bill_no: str | None = None
    supplier_name: str | None = None
    vehicle_no: str | None = None
    bill_total: Decimal | None = None
    commission_pct: Decimal | None = None
    commission_amount: Decimal | None = None
    payment_date: date | None = None
    paid: bool | None = None


class AgentCommissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    company_id: uuid.UUID | None
    agent_id: uuid.UUID
    bill_no: str | None
    supplier_name: str | None
    vehicle_no: str | None
    bill_total: Decimal
    commission_pct: Decimal
    commission_amount: Decimal
    payment_date: date | None
    paid: bool
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/", response_model=list[AgentCommissionResponse])
async def list_agent_commissions(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    search: str = Query("", description="Search by bill number or supplier name"),
    company_id: uuid.UUID | None = Query(None),
    agent_id: uuid.UUID | None = Query(None),
    paid: bool | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    q = select(AgentCommission).where(AgentCommission.user_id == user.id)
    if search:
        from sqlalchemy import or_
        q = q.where(or_(
            AgentCommission.bill_no.ilike(f"%{search}%"),
            AgentCommission.supplier_name.ilike(f"%{search}%"),
        ))
    if company_id:
        q = q.where(AgentCommission.company_id == company_id)
    if agent_id:
        q = q.where(AgentCommission.agent_id == agent_id)
    if paid is not None:
        q = q.where(AgentCommission.paid == paid)
    q = q.order_by(AgentCommission.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{item_id}", response_model=AgentCommissionResponse)
async def get_agent_commission(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(AgentCommission).where(
            AgentCommission.id == item_id, AgentCommission.user_id == user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    return item


@router.post("/", response_model=AgentCommissionResponse, status_code=201)
async def create_agent_commission(
    data: AgentCommissionCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = AgentCommission(user_id=user.id, **data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=AgentCommissionResponse)
async def update_agent_commission(
    item_id: uuid.UUID,
    data: AgentCommissionUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(AgentCommission).where(
            AgentCommission.id == item_id, AgentCommission.user_id == user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
async def delete_agent_commission(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(AgentCommission).where(
            AgentCommission.id == item_id, AgentCommission.user_id == user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    await db.delete(item)
    await db.commit()
