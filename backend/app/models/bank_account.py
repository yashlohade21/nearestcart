import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

TZ = DateTime(timezone=True)


class BankAccount(Base):
    __tablename__ = "bank_accounts"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    bank_name: Mapped[str] = mapped_column(String(100))
    account_holder_name: Mapped[str | None] = mapped_column(String(150))
    account_no: Mapped[str | None] = mapped_column(String(30))
    account_type: Mapped[str | None] = mapped_column(String(20), default="current")
    ifsc_code: Mapped[str | None] = mapped_column(String(11))
    branch: Mapped[str | None] = mapped_column(String(150))
    opening_balance: Mapped[float | None] = mapped_column(Numeric(14, 2), default=0)
    current_balance: Mapped[float | None] = mapped_column(Numeric(14, 2), default=0)
    notes: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(TZ, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        TZ,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="bank_accounts")
    bank_transactions = relationship("BankTransaction", back_populates="bank_account", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="bank_account", cascade="all, delete-orphan")
