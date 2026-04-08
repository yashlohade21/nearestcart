import json
import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


def is_configured() -> bool:
    return bool(settings.FCM_SERVER_KEY)


async def send_push(token: str, title: str, body: str, data: dict | None = None) -> bool:
    """Send a push notification via FCM legacy HTTP API."""
    if not is_configured() or not token:
        return False

    payload = {
        "to": token,
        "notification": {
            "title": title,
            "body": body,
            "sound": "default",
        },
    }
    if data:
        payload["data"] = data

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                "https://fcm.googleapis.com/fcm/send",
                json=payload,
                headers={
                    "Authorization": f"key={settings.FCM_SERVER_KEY}",
                    "Content-Type": "application/json",
                },
            )
            result = resp.json()
            if result.get("success", 0) > 0:
                return True
            logger.warning(f"FCM send failed: {result}")
            return False
    except Exception as e:
        logger.error(f"FCM push error: {e}")
        return False


async def send_push_to_user(db, user_id, title: str, body: str, data: dict | None = None) -> bool:
    """Send push notification to a user by their ID."""
    from sqlalchemy import select
    from app.models.user import User

    result = await db.execute(select(User.fcm_token).where(User.id == user_id))
    token = result.scalar_one_or_none()
    if not token:
        return False
    return await send_push(token, title, body, data)
