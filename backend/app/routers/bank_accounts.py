import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.bank_account import BankAccount
from app.models.user import User
from app.schemas.bank_account import BankAccountCreate, BankAccountResponse, BankAccountUpdate

router = APIRouter(prefix="/bank-accounts", tags=["bank-accounts"])


@router.get("", response_model=list[BankAccountResponse])
async def list_bank_accounts(
    search: str | None = Query(None),
    limit: int = 50,
    offset: int = 0,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(BankAccount)
        .where(BankAccount.user_id == user.id, BankAccount.is_active.is_(True))
        .order_by(BankAccount.bank_name)
    )
    if search:
        query = query.where(BankAccount.bank_name.ilike(f"%{search}%"))
    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=BankAccountResponse, status_code=status.HTTP_201_CREATED)
async def create_bank_account(
    body: BankAccountCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    bank = BankAccount(user_id=user.id, **body.model_dump(exclude_none=True))
    db.add(bank)
    await db.commit()
    await db.refresh(bank)
    return bank


@router.get("/{bank_id}", response_model=BankAccountResponse)
async def get_bank_account(
    bank_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BankAccount).where(BankAccount.id == bank_id, BankAccount.user_id == user.id)
    )
    bank = result.scalar_one_or_none()
    if not bank:
        raise HTTPException(status_code=404, detail="Bank account not found")
    return bank


@router.patch("/{bank_id}", response_model=BankAccountResponse)
async def update_bank_account(
    bank_id: uuid.UUID,
    body: BankAccountUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BankAccount).where(BankAccount.id == bank_id, BankAccount.user_id == user.id)
    )
    bank = result.scalar_one_or_none()
    if not bank:
        raise HTTPException(status_code=404, detail="Bank account not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(bank, field, value)
    await db.commit()
    await db.refresh(bank)
    return bank


@router.delete("/{bank_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bank_account(
    bank_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BankAccount).where(BankAccount.id == bank_id, BankAccount.user_id == user.id)
    )
    bank = result.scalar_one_or_none()
    if not bank:
        raise HTTPException(status_code=404, detail="Bank account not found")
    bank.is_active = False
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
