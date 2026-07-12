import uuid
from datetime import date, datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.stock_ledger import StockLedger
from app.models.user import User

router = APIRouter(prefix="/stock-ledger", tags=["stock-ledger"])


# ---------------------------------------------------------------------------
# Inline Pydantic schemas (no separate schema file exists for stock_ledger)
# ---------------------------------------------------------------------------

class StockLedgerCreate(BaseModel):
    company_id: uuid.UUID | None = None
    product_id: uuid.UUID
    txn_date: date
    txn_type: str  # purchase / sale / return / loss
    quantity: Decimal
    reference_id: uuid.UUID | None = None
    reference_type: str | None = None
    balance_after: Decimal


class StockLedgerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    company_id: uuid.UUID | None
    product_id: uuid.UUID
    txn_date: date
    txn_type: str
    quantity: Decimal
    reference_id: uuid.UUID | None
    reference_type: str | None
    balance_after: Decimal
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Routes — GET list and POST only (no update/delete per spec)
# ---------------------------------------------------------------------------

@router.get("/", response_model=list[StockLedgerResponse])
async def list_stock_ledger(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    company_id: uuid.UUID | None = Query(None),
    product_id: uuid.UUID | None = Query(None),
    txn_type: str | None = Query(None, description="Filter by transaction type"),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    q = select(StockLedger).where(StockLedger.user_id == user.id)
    if company_id:
        q = q.where(StockLedger.company_id == company_id)
    if product_id:
        q = q.where(StockLedger.product_id == product_id)
    if txn_type:
        q = q.where(StockLedger.txn_type == txn_type)
    q = q.order_by(StockLedger.txn_date.desc(), StockLedger.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/", response_model=StockLedgerResponse, status_code=201)
async def create_stock_ledger_entry(
    data: StockLedgerCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = StockLedger(user_id=user.id, **data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item
