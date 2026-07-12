import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.expense import Expense
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.get("/", response_model=list[ExpenseResponse])
async def list_expenses(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    search: str = Query("", description="Search by party name, category, or narration"),
    company_id: uuid.UUID | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    q = select(Expense).where(Expense.user_id == user.id)
    if search:
        q = q.where(
            Expense.party_name.ilike(f"%{search}%")
            | Expense.category.ilike(f"%{search}%")
            | Expense.narration.ilike(f"%{search}%")
        )
    if company_id:
        q = q.where(Expense.company_id == company_id)
    q = q.order_by(Expense.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{item_id}", response_model=ExpenseResponse)
async def get_expense(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Expense).where(Expense.id == item_id, Expense.user_id == user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    return item


@router.post("/", response_model=ExpenseResponse, status_code=201)
async def create_expense(
    data: ExpenseCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = Expense(user_id=user.id, **data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=ExpenseResponse)
async def update_expense(
    item_id: uuid.UUID,
    data: ExpenseUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Expense).where(Expense.id == item_id, Expense.user_id == user.id)
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
async def delete_expense(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Expense).where(Expense.id == item_id, Expense.user_id == user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    await db.delete(item)
    await db.commit()
