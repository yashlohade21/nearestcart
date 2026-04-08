import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

TZ = DateTime(timezone=True)


class MandiRate(Base):
    __tablename__ = "mandi_rates"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    product_name: Mapped[str] = mapped_column(String(100))
    mandi_name: Mapped[str] = mapped_column(String(150))
    city: Mapped[str] = mapped_column(String(100))
    state: Mapped[str] = mapped_column(String(50))
    min_price: Mapped[float | None] = mapped_column(Numeric(10, 2))
    max_price: Mapped[float | None] = mapped_column(Numeric(10, 2))
    modal_price: Mapped[float | None] = mapped_column(Numeric(10, 2))
    unit: Mapped[str] = mapped_column(String(20), default="quintal")
    rate_date: Mapped[date] = mapped_column(Date)
    source: Mapped[str] = mapped_column(String(50), default="enam")
    created_at: Mapped[datetime] = mapped_column(
        TZ, default=lambda: datetime.now(timezone.utc)
    )
