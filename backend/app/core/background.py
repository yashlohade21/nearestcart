import asyncio
import logging
from datetime import date, timedelta

from sqlalchemy import select, func

from app.core.database import async_session
from app.models.deal import Deal

logger = logging.getLogger(__name__)


async def check_overdue_payments():
    """Log overdue payments (>7 days). In production, this would trigger notifications."""
    async with async_session() as db:
        today = date.today()
        threshold = today - timedelta(days=7)
        result = await db.execute(
            select(func.count()).where(
                Deal.buyer_payment_status != "paid",
                Deal.deal_date <= threshold,
            )
        )
        count = result.scalar()
        if count:
            logger.info(f"Found {count} overdue buyer payments (>7 days)")

        # Send push notifications for overdue deals
        if count and count > 0:
            from app.core.push import send_push_to_user, is_configured
            if is_configured():
                # Get unique user_ids with overdue payments
                user_result = await db.execute(
                    select(Deal.user_id).where(
                        Deal.buyer_payment_status != "paid",
                        Deal.deal_date <= threshold,
                    ).distinct()
                )
                user_ids = [row[0] for row in user_result.all()]
                for uid in user_ids:
                    await send_push_to_user(
                        db, uid,
                        "Payment Reminder",
                        f"You have overdue payments (>7 days). Check your pending payments.",
                        {"type": "overdue_payments"},
                    )


async def run_scheduled_tasks():
    """Run background tasks periodically."""
    while True:
        try:
            await check_overdue_payments()
        except Exception as e:
            logger.error(f"Background task error: {e}")
        await asyncio.sleep(3600)  # Run every hour
