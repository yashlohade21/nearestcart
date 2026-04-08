import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.advance import Advance
from app.models.user import User
from app.schemas.advance import AdvanceCreate, AdvanceResponse, AdvanceUpdate

router = APIRouter(prefix="/advances", tags=["advances"])


@router.get("", response_model=list[AdvanceResponse])
async def list_advances(
    status: str | None = None,
    limit: int = 50,
    offset: int = 0,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Advance)
        .options(selectinload(Advance.farmer))
        .where(Advance.user_id == user.id)
        .order_by(Advance.given_date.desc())
    )
    if status:
        query = query.where(Advance.status == status)
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    advances = result.scalars().all()
    return [
        AdvanceResponse(
            **{c.key: getattr(a, c.key) for c in Advance.__table__.columns},
            farmer_name=a.farmer.name if a.farmer else None,
        )
        for a in advances
    ]


@router.get("/active", response_model=list[AdvanceResponse])
async def list_active_advances(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Advance)
        .options(selectinload(Advance.farmer))
        .where(Advance.user_id == user.id, Advance.status.in_(["active", "partial"]))
        .order_by(Advance.given_date.desc())
    )
    advances = result.scalars().all()
    return [
        AdvanceResponse(
            **{c.key: getattr(a, c.key) for c in Advance.__table__.columns},
            farmer_name=a.farmer.name if a.farmer else None,
        )
        for a in advances
    ]


@router.post("", response_model=AdvanceResponse, status_code=status.HTTP_201_CREATED)
async def create_advance(
    body: AdvanceCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    advance = Advance(user_id=user.id, **body.model_dump(exclude_none=True))
    db.add(advance)
    await db.commit()
    await db.refresh(advance, ["farmer"])
    return AdvanceResponse(
        **{c.key: getattr(advance, c.key) for c in Advance.__table__.columns},
        farmer_name=advance.farmer.name if advance.farmer else None,
    )


@router.patch("/{advance_id}", response_model=AdvanceResponse)
async def update_advance(
    advance_id: uuid.UUID,
    body: AdvanceUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Advance)
        .options(selectinload(Advance.farmer))
        .where(Advance.id == advance_id, Advance.user_id == user.id)
    )
    advance = result.scalar_one_or_none()
    if not advance:
        raise HTTPException(status_code=404, detail="Advance not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(advance, field, value)
    await db.commit()
    await db.refresh(advance)
    return AdvanceResponse(
        **{c.key: getattr(advance, c.key) for c in Advance.__table__.columns},
        farmer_name=advance.farmer.name if advance.farmer else None,
    )
