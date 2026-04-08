import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = DateTime(timezone=True)


class Deal(Base):
    __tablename__ = "deals"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    farmer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("farmers.id"), index=True)
    buyer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("buyers.id"), index=True)
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"), index=True)

    # Quantities
    quantity: Mapped[float] = mapped_column(Numeric(10, 2))
    unit: Mapped[str] = mapped_column(String(20), default="kg")

    # Pricing
    buy_rate: Mapped[float] = mapped_column(Numeric(10, 2))
    sell_rate: Mapped[float] = mapped_column(Numeric(10, 2))

    # Costs
    transport_cost: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    labour_cost: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    other_cost: Mapped[float] = mapped_column(Numeric(10, 2), default=0)

    # Status
    status: Mapped[str] = mapped_column(String(20), default="pending")
    farmer_payment_status: Mapped[str] = mapped_column(String(20), default="unpaid")
    buyer_payment_status: Mapped[str] = mapped_column(String(20), default="unpaid")
    farmer_paid_amount: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    buyer_received_amount: Mapped[float] = mapped_column(Numeric(14, 2), default=0)

    # Spoilage
    spoilage_qty: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    spoilage_reason: Mapped[str | None] = mapped_column(String(100))

    # Transport
    transporter_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("transporters.id"), index=True)

    # Dates
    deal_date: Mapped[date] = mapped_column(Date, default=date.today)
    delivery_date: Mapped[date | None] = mapped_column(Date)
    payment_due_date: Mapped[date | None] = mapped_column(Date)

    # Quality
    quality_grade: Mapped[str | None] = mapped_column(String(10))
    has_dispute: Mapped[bool] = mapped_column(Boolean, default=False)
    dispute_notes: Mapped[str | None] = mapped_column(Text)

    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        TZ,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Computed properties (DB has GENERATED ALWAYS columns, but SQLAlchemy can't write to those)
    @property
    def buy_total(self) -> float:
        return float(self.quantity) * float(self.buy_rate)

    @property
    def sell_total(self) -> float:
        return float(self.quantity) * float(self.sell_rate)

    @property
    def gross_margin(self) -> float:
        return self.sell_total - self.buy_total

    @property
    def total_cost(self) -> float:
        return float(self.transport_cost) + float(self.labour_cost) + float(self.other_cost)

    @property
    def net_profit(self) -> float:
        return self.gross_margin - self.total_cost

    user = relationship("User", back_populates="deals")
    farmer = relationship("Farmer", back_populates="deals")
    buyer = relationship("Buyer", back_populates="deals")
    product = relationship("Product", back_populates="deals")
    transporter = relationship("Transporter", back_populates="deals")
    payments = relationship("Payment", back_populates="deal", cascade="all, delete-orphan")
    photos = relationship("Photo", back_populates="deal", cascade="all, delete-orphan")
