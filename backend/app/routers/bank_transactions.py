import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.bank_transaction import BankTransaction
from app.models.user import User
from app.schemas.bank_transaction import (
    BankTransactionCreate,
    BankTransactionUpdate,
    BankTransactionResponse,
)

router = APIRouter(prefix="/bank-transactions", tags=["bank-transactions"])


@router.get("/", response_model=list[BankTransactionResponse])
async def list_bank_transactions(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    search: str = Query("", description="Search by party name or narration"),
    company_id: uuid.UUID | None = Query(None),
    bank_account_id: uuid.UUID | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    q = select(BankTransaction).where(BankTransaction.user_id == user.id)
    if search:
        q = q.where(
            BankTransaction.party_name.ilike(f"%{search}%")
            | BankTransaction.narration.ilike(f"%{search}%")
        )
    if company_id:
        q = q.where(BankTransaction.company_id == company_id)
    if bank_account_id:
        q = q.where(BankTransaction.bank_account_id == bank_account_id)
    q = q.order_by(BankTransaction.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{item_id}", response_model=BankTransactionResponse)
async def get_bank_transaction(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(BankTransaction).where(
            BankTransaction.id == item_id, BankTransaction.user_id == user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    return item


@router.post("/", response_model=BankTransactionResponse, status_code=201)
async def create_bank_transaction(
    data: BankTransactionCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = BankTransaction(user_id=user.id, **data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=BankTransactionResponse)
async def update_bank_transaction(
    item_id: uuid.UUID,
    data: BankTransactionUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(BankTransaction).where(
            BankTransaction.id == item_id, BankTransaction.user_id == user.id
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
async def delete_bank_transaction(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(BankTransaction).where(
            BankTransaction.id == item_id, BankTransaction.user_id == user.id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    await db.delete(item)
    await db.commit()
