import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = DateTime(timezone=True)


class NaveBill(Base):
    __tablename__ = "nave_bills"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    company_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("companies.id"), index=True)
    buyer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("buyers.id"), index=True)

    bill_no: Mapped[str] = mapped_column(String(50))
    bill_date: Mapped[date] = mapped_column(Date, default=date.today)
    total_amount: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    total_deductions: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    net_amount: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    status: Mapped[str] = mapped_column(String(20), default="draft")

    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        TZ,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="nave_bills")
    company = relationship("Company", back_populates="nave_bills")
    buyer = relationship("Buyer", back_populates="nave_bills")
    items = relationship("NaveBillItem", back_populates="nave_bill", cascade="all, delete-orphan")
    details = relationship("NaveBillDetail", back_populates="nave_bill", uselist=False, cascade="all, delete-orphan")


class NaveBillItem(Base):
    __tablename__ = "nave_bill_items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    nave_bill_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("nave_bills.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("products.id"), index=True)

    kharidar_name: Mapped[str] = mapped_column(String(200))
    pauti_no: Mapped[str | None] = mapped_column(String(50))
    weight: Mapped[float] = mapped_column(Numeric(10, 2))
    rate: Mapped[float] = mapped_column(Numeric(10, 2))
    amount: Mapped[float] = mapped_column(Numeric(14, 2))

    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        TZ,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    nave_bill = relationship("NaveBill", back_populates="items")
    product = relationship("Product", back_populates="nave_bill_items")


class NaveBillDetail(Base):
    __tablename__ = "nave_bill_details"

    __table_args__ = (UniqueConstraint("nave_bill_id", name="uq_nave_bill_details_nave_bill_id"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    nave_bill_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("nave_bills.id", ondelete="CASCADE"), index=True)

    market_fees: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    supervision: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    adat: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    bardan: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    labour: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    gadi_bhada: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    sutli: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    weight_short: Mapped[float] = mapped_column(Numeric(14, 2), default=0)

    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        TZ,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    nave_bill = relationship("NaveBill", back_populates="details")
