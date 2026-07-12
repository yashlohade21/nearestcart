"""
Superadmin endpoints — view all orgs, global audit, org-level stats.
Only accessible by users with role='superadmin'.
"""
import uuid
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select, func, desc, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.audit import AuditLog
from app.models.deal import Deal
from app.models.payment import Payment
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


def _require_superadmin(user: User) -> User:
    if user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superadmin access required",
        )
    return user


# ── Schemas ──


class OrgSummary(BaseModel):
    id: str
    phone: str
    name: str
    business_name: str | None
    city: str | None
    state: str | None
    gst_number: str | None
    logo_url: str | None
    plan: str
    is_active: bool
    created_at: str
    # Stats
    total_deals: int = 0
    total_revenue: float = 0
    total_profit: float = 0
    team_size: int = 0
    last_active: str | None = None


class OrgDetail(OrgSummary):
    address: str | None
    mandi_name: str | None
    upi_id: str | None
    deals_today: int = 0
    deals_this_week: int = 0
    deals_this_month: int = 0
    pending_from_buyers: float = 0
    pending_to_farmers: float = 0


class GlobalAuditEntry(BaseModel):
    id: str
    user_id: str | None
    user_name: str | None
    user_business: str | None
    action: str
    entity_type: str
    entity_id: str
    changes: dict | None
    created_at: str


class AdminDashboard(BaseModel):
    total_orgs: int
    active_orgs: int
    total_deals_today: int
    total_revenue_today: float
    total_deals_this_month: int
    total_revenue_this_month: float
    recent_signups: list[OrgSummary]


# ── Endpoints ──


@router.get("/dashboard", response_model=AdminDashboard)
async def admin_dashboard(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _require_superadmin(user)
    today = date.today()
    month_start = today.replace(day=1)

    # Org counts
    total_orgs_q = await db.execute(
        select(func.count()).select_from(User).where(User.role == "owner")
    )
    total_orgs = total_orgs_q.scalar() or 0

    active_orgs_q = await db.execute(
        select(func.count()).select_from(User).where(User.role == "owner", User.is_active.is_(True))
    )
    active_orgs = active_orgs_q.scalar() or 0

    # Today's deals
    today_q = await db.execute(
        select(
            func.count().label("cnt"),
            func.coalesce(func.sum(Deal.quantity * Deal.sell_rate), 0).label("rev"),
        ).where(Deal.deal_date == today)
    )
    today_row = today_q.one()

    # Month deals
    month_q = await db.execute(
        select(
            func.count().label("cnt"),
            func.coalesce(func.sum(Deal.quantity * Deal.sell_rate), 0).label("rev"),
        ).where(Deal.deal_date >= month_start)
    )
    month_row = month_q.one()

    # Recent signups (last 10 owners)
    recent_q = await db.execute(
        select(User)
        .where(User.role == "owner")
        .order_by(desc(User.created_at))
        .limit(10)
    )
    recent_users = recent_q.scalars().all()
    recent = [
        OrgSummary(
            id=str(u.id), phone=u.phone, name=u.name,
            business_name=u.business_name, city=u.city, state=u.state,
            gst_number=u.gst_number, logo_url=u.logo_url,
            plan=u.plan, is_active=u.is_active,
            created_at=str(u.created_at),
        )
        for u in recent_users
    ]

    return AdminDashboard(
        total_orgs=total_orgs,
        active_orgs=active_orgs,
        total_deals_today=today_row.cnt,
        total_revenue_today=float(today_row.rev),
        total_deals_this_month=month_row.cnt,
        total_revenue_this_month=float(month_row.rev),
        recent_signups=recent,
    )


@router.get("/orgs", response_model=list[OrgSummary])
async def list_orgs(
    search: str | None = None,
    limit: int = Query(default=50, le=200),
    offset: int = 0,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _require_superadmin(user)

    query = select(User).where(User.role == "owner").order_by(desc(User.created_at))
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            User.name.ilike(pattern)
            | User.business_name.ilike(pattern)
            | User.phone.ilike(pattern)
            | User.city.ilike(pattern)
        )
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    owners = result.scalars().all()

    # Batch-fetch stats for these owners
    owner_ids = [o.id for o in owners]
    if not owner_ids:
        return []

    # Deal stats per owner
    deal_stats_q = await db.execute(
        select(
            Deal.user_id,
            func.count().label("total_deals"),
            func.coalesce(func.sum(Deal.quantity * Deal.sell_rate), 0).label("total_revenue"),
            func.coalesce(func.sum(
                Deal.quantity * (Deal.sell_rate - Deal.buy_rate)
                - Deal.transport_cost - Deal.labour_cost - Deal.other_cost
            ), 0).label("total_profit"),
        )
        .where(Deal.user_id.in_(owner_ids))
        .group_by(Deal.user_id)
    )
    deal_stats = {row.user_id: row for row in deal_stats_q.all()}

    # Team size per owner
    team_q = await db.execute(
        select(User.owner_id, func.count().label("cnt"))
        .where(User.owner_id.in_(owner_ids), User.is_active.is_(True))
        .group_by(User.owner_id)
    )
    team_sizes = {row.owner_id: row.cnt for row in team_q.all()}

    # Last audit activity per owner
    last_activity_q = await db.execute(
        select(AuditLog.user_id, func.max(AuditLog.created_at).label("last"))
        .where(AuditLog.user_id.in_(owner_ids))
        .group_by(AuditLog.user_id)
    )
    last_active = {row.user_id: str(row.last) for row in last_activity_q.all()}

    orgs = []
    for o in owners:
        stats = deal_stats.get(o.id)
        orgs.append(OrgSummary(
            id=str(o.id), phone=o.phone, name=o.name,
            business_name=o.business_name, city=o.city, state=o.state,
            gst_number=o.gst_number, logo_url=o.logo_url,
            plan=o.plan, is_active=o.is_active,
            created_at=str(o.created_at),
            total_deals=stats.total_deals if stats else 0,
            total_revenue=float(stats.total_revenue) if stats else 0,
            total_profit=float(stats.total_profit) if stats else 0,
            team_size=team_sizes.get(o.id, 0),
            last_active=last_active.get(o.id),
        ))

    return orgs


@router.get("/orgs/{org_id}", response_model=OrgDetail)
async def get_org_detail(
    org_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _require_superadmin(user)

    result = await db.execute(select(User).where(User.id == org_id, User.role == "owner"))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)

    # All-time stats
    all_q = await db.execute(
        select(
            func.count().label("total_deals"),
            func.coalesce(func.sum(Deal.quantity * Deal.sell_rate), 0).label("total_revenue"),
            func.coalesce(func.sum(
                Deal.quantity * (Deal.sell_rate - Deal.buy_rate)
                - Deal.transport_cost - Deal.labour_cost - Deal.other_cost
            ), 0).label("total_profit"),
        ).where(Deal.user_id == org_id)
    )
    all_row = all_q.one()

    # Period deal counts
    period_q = await db.execute(
        select(
            func.count().filter(Deal.deal_date == today).label("today"),
            func.count().filter(Deal.deal_date >= week_start).label("week"),
            func.count().filter(Deal.deal_date >= month_start).label("month"),
        ).where(Deal.user_id == org_id)
    )
    period = period_q.one()

    # Pending amounts
    buyer_pending_q = await db.execute(
        select(
            func.coalesce(func.sum(Deal.quantity * Deal.sell_rate - Deal.buyer_received_amount), 0)
        ).where(Deal.user_id == org_id, Deal.buyer_payment_status != "paid")
    )
    pending_from = float(buyer_pending_q.scalar())

    farmer_pending_q = await db.execute(
        select(
            func.coalesce(func.sum(Deal.quantity * Deal.buy_rate - Deal.farmer_paid_amount), 0)
        ).where(Deal.user_id == org_id, Deal.farmer_payment_status != "paid")
    )
    pending_to = float(farmer_pending_q.scalar())

    # Team size
    team_q = await db.execute(
        select(func.count()).select_from(User).where(User.owner_id == org_id, User.is_active.is_(True))
    )
    team_size = team_q.scalar() or 0

    return OrgDetail(
        id=str(org.id), phone=org.phone, name=org.name,
        business_name=org.business_name, city=org.city, state=org.state,
        gst_number=org.gst_number, logo_url=org.logo_url,
        plan=org.plan, is_active=org.is_active,
        created_at=str(org.created_at),
        address=org.address, mandi_name=org.mandi_name, upi_id=org.upi_id,
        total_deals=all_row.total_deals,
        total_revenue=float(all_row.total_revenue),
        total_profit=float(all_row.total_profit),
        team_size=team_size,
        deals_today=period.today,
        deals_this_week=period.week,
        deals_this_month=period.month,
        pending_from_buyers=pending_from,
        pending_to_farmers=pending_to,
    )


@router.get("/audit", response_model=list[GlobalAuditEntry])
async def global_audit_log(
    user_id: uuid.UUID | None = None,
    entity_type: str | None = None,
    action: str | None = None,
    limit: int = Query(default=50, le=200),
    offset: int = 0,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    _require_superadmin(user)

    query = (
        select(AuditLog, User.name.label("user_name"), User.business_name.label("user_business"))
        .outerjoin(User, AuditLog.user_id == User.id)
        .order_by(desc(AuditLog.created_at))
    )
    if user_id:
        query = query.where(AuditLog.user_id == user_id)
    if entity_type:
        query = query.where(AuditLog.entity_type == entity_type)
    if action:
        query = query.where(AuditLog.action == action)
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    rows = result.all()

    return [
        GlobalAuditEntry(
            id=str(log.id),
            user_id=str(log.user_id) if log.user_id else None,
            user_name=user_name,
            user_business=user_business,
            action=log.action,
            entity_type=log.entity_type,
            entity_id=str(log.entity_id),
            changes=log.changes,
            created_at=str(log.created_at),
        )
        for log, user_name, user_business in rows
    ]


@router.patch("/orgs/{org_id}/plan")
async def update_org_plan(
    org_id: uuid.UUID,
    plan: str = Query(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Superadmin can change an org's plan (free/pro/enterprise)."""
    _require_superadmin(user)

    result = await db.execute(select(User).where(User.id == org_id, User.role == "owner"))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    old_plan = org.plan
    org.plan = plan
    await db.commit()
    return {"message": f"Plan updated from {old_plan} to {plan}"}


@router.patch("/orgs/{org_id}/toggle")
async def toggle_org(
    org_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Superadmin can activate/deactivate an org."""
    _require_superadmin(user)

    result = await db.execute(select(User).where(User.id == org_id, User.role == "owner"))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    org.is_active = not org.is_active
    await db.commit()
    return {"message": f"Organization {'activated' if org.is_active else 'deactivated'}", "is_active": org.is_active}
