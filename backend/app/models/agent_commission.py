import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = DateTime(timezone=True)


class AgentCommission(Base):
    __tablename__ = "agent_commissions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    company_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("companies.id"), index=True)
    agent_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("agents.id"), index=True)

    bill_no: Mapped[str | None] = mapped_column(String(50))
    supplier_name: Mapped[str | None] = mapped_column(String(200))
    vehicle_no: Mapped[str | None] = mapped_column(String(20))

    bill_total: Mapped[float] = mapped_column(Numeric(14, 2))
    commission_pct: Mapped[float] = mapped_column(Numeric(5, 2))
    commission_amount: Mapped[float] = mapped_column(Numeric(14, 2))

    payment_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    paid: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        TZ,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="agent_commissions")
    company = relationship("Company", back_populates="agent_commissions")
    agent = relationship("Agent", back_populates="agent_commissions")
