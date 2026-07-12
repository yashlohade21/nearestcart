import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = DateTime(timezone=True)


class FarmerSale(Base):
    __tablename__ = "farmer_sales"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    company_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("companies.id"), index=True)
    farmer_entry_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("farmer_entries.id"), index=True)

    market_fees: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    supervision: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    adat_commission: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    bardan: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    labour: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    sutli: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    gadi_bhada: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    weight_short: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    total_deductions: Mapped[float] = mapped_column(Numeric(14, 2), default=0)
    net_payable: Mapped[float] = mapped_column(Numeric(14, 2), default=0)

    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        TZ,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="farmer_sales")
    company = relationship("Company", back_populates="farmer_sales")
    farmer_entry = relationship("FarmerEntry", back_populates="farmer_sale")
