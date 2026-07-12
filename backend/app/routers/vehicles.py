import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.vehicle import Vehicle
from app.models.user import User

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


# ---------------------------------------------------------------------------
# Inline Pydantic schemas (no separate schema file exists for vehicle)
# ---------------------------------------------------------------------------

class VehicleCreate(BaseModel):
    company_id: uuid.UUID | None = None
    vehicle_no: str
    owner_name: str | None = None
    driver_name: str | None = None
    phone: str | None = None
    vehicle_type: str | None = None
    is_active: bool = True


class VehicleUpdate(BaseModel):
    company_id: uuid.UUID | None = None
    vehicle_no: str | None = None
    owner_name: str | None = None
    driver_name: str | None = None
    phone: str | None = None
    vehicle_type: str | None = None
    is_active: bool | None = None


class VehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    company_id: uuid.UUID | None
    vehicle_no: str
    owner_name: str | None
    driver_name: str | None
    phone: str | None
    vehicle_type: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/", response_model=list[VehicleResponse])
async def list_vehicles(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    search: str = Query("", description="Search by vehicle number, owner, or driver"),
    company_id: uuid.UUID | None = Query(None),
    is_active: bool | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    q = select(Vehicle).where(Vehicle.user_id == user.id)
    if search:
        from sqlalchemy import or_
        q = q.where(or_(
            Vehicle.vehicle_no.ilike(f"%{search}%"),
            Vehicle.owner_name.ilike(f"%{search}%") if Vehicle.owner_name is not None else False,
            Vehicle.driver_name.ilike(f"%{search}%") if Vehicle.driver_name is not None else False,
        ))
    if company_id:
        q = q.where(Vehicle.company_id == company_id)
    if is_active is not None:
        q = q.where(Vehicle.is_active == is_active)
    q = q.order_by(Vehicle.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/{item_id}", response_model=VehicleResponse)
async def get_vehicle(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Vehicle).where(Vehicle.id == item_id, Vehicle.user_id == user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    return item


@router.post("/", response_model=VehicleResponse, status_code=201)
async def create_vehicle(
    data: VehicleCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = Vehicle(user_id=user.id, **data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=VehicleResponse)
async def update_vehicle(
    item_id: uuid.UUID,
    data: VehicleUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Vehicle).where(Vehicle.id == item_id, Vehicle.user_id == user.id)
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
async def delete_vehicle(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Vehicle).where(Vehicle.id == item_id, Vehicle.user_id == user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Not found")
    await db.delete(item)
    await db.commit()
