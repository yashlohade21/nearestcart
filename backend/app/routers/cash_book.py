import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.cash_entry import CashEntry
from app.models.user import User
from app.schemas.cash_entry import CashEntryCreate, CashEntryUpdate, CashEntryResponse

router = APIRouter(prefix="/cash-book", tags=["cash-book"])


@router.get("/", response_model=list[CashEntryResponse])
async def list_cash_entries(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    search: str = Query("", description="Search by party name or narration"),
    company_id: uuid.UUID | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    q = select(CashEntry).where(CashEntry.user_id == user.id)
    if search:
        from sqlalchemy import or_
        q = q.where(or_(
            CashEntry.party_name.ilike(f"%{search}%"),
            CashEntry.narration.ilike(f"%{search}%"),
        ))
    if company_id:
        q = q.where(CashEntry.company_id == company_id)
    q = q.order_by(CashEntry.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{item_id}", response_model=CashEntryResponse)
async def get_cash_entry(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(CashEntry).where(CashEntry.id == item_id, CashEntry.user_id == user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    return item


@router.post("/", response_model=CashEntryResponse, status_code=201)
async def create_cash_entry(
    data: CashEntryCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = CashEntry(user_id=user.id, **data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=CashEntryResponse)
async def update_cash_entry(
    item_id: uuid.UUID,
    data: CashEntryUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(CashEntry).where(CashEntry.id == item_id, CashEntry.user_id == user.id)
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
async def delete_cash_entry(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(CashEntry).where(CashEntry.id == item_id, CashEntry.user_id == user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    await db.delete(item)
    await db.commit()
