import uuid

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.audit import AuditLog
from app.models.user import User

router = APIRouter(prefix="/audit", tags=["audit"])


class AuditLogResponse(BaseModel):
    id: str
    user_id: str | None
    action: str
    entity_type: str
    entity_id: str
    changes: dict | None
    ip_address: str | None
    created_at: str

    model_config = {"from_attributes": True}


@router.get("", response_model=list[AuditLogResponse])
async def list_audit_logs(
    entity_type: str | None = None,
    entity_id: str | None = None,
    limit: int = Query(default=50, le=200),
    offset: int = 0,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(AuditLog).where(AuditLog.user_id == user.id)
    if entity_type:
        query = query.where(AuditLog.entity_type == entity_type)
    if entity_id:
        query = query.where(AuditLog.entity_id == uuid.UUID(entity_id))
    query = query.order_by(desc(AuditLog.created_at)).limit(limit).offset(offset)
    result = await db.execute(query)
    logs = result.scalars().all()
    return [
        AuditLogResponse(
            id=str(log.id),
            user_id=str(log.user_id) if log.user_id else None,
            action=log.action,
            entity_type=log.entity_type,
            entity_id=str(log.entity_id),
            changes=log.changes,
            ip_address=log.ip_address,
            created_at=str(log.created_at),
        )
        for log in logs
    ]
