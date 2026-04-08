import logging
from urllib.parse import quote

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

GRAPH_API = "https://graph.facebook.com/v18.0"


def is_configured() -> bool:
    return bool(settings.WHATSAPP_TOKEN and settings.WHATSAPP_PHONE_ID)


async def send_text_message(phone: str, message: str) -> bool:
    """Send a plain text message via WhatsApp Cloud API."""
    if not is_configured():
        logger.warning("WhatsApp not configured, skipping send")
        return False

    # Ensure +91 prefix for Indian numbers
    if not phone.startswith("+"):
        phone = f"+91{phone}" if not phone.startswith("91") else f"+{phone}"

    url = f"{GRAPH_API}/{settings.WHATSAPP_PHONE_ID}/messages"
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": phone,
        "type": "text",
        "text": {"body": message},
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            logger.info(f"WhatsApp message sent to {phone}")
            return True
    except Exception as e:
        logger.error(f"WhatsApp send failed for {phone}: {e}")
        return False


async def send_payment_reminder(
    phone: str,
    party_name: str,
    amount: float,
    dalla_name: str,
    upi_link: str | None = None,
) -> bool:
    """Send a payment reminder message."""
    message = (
        f"Payment Reminder from {dalla_name}\n\n"
        f"Dear {party_name},\n"
        f"A payment of ₹{amount:,.2f} is pending.\n"
        f"Please arrange payment at your earliest convenience.\n"
    )
    if upi_link:
        message += f"\nPay now: {upi_link}\n"
    message += f"\nThank you,\n{dalla_name}"
    return await send_text_message(phone, message)


async def send_deal_confirmation(
    phone: str,
    party_name: str,
    product_name: str,
    quantity: float,
    unit: str,
    rate: float,
    total: float,
    dalla_name: str,
) -> bool:
    """Send a deal confirmation message."""
    message = (
        f"Deal Confirmation from {dalla_name}\n\n"
        f"Dear {party_name},\n"
        f"Product: {product_name}\n"
        f"Quantity: {quantity} {unit}\n"
        f"Rate: ₹{rate:,.2f}/{unit}\n"
        f"Total: ₹{total:,.2f}\n\n"
        f"Thank you for your business!\n{dalla_name}"
    )
    return await send_text_message(phone, message)


def generate_upi_link(
    upi_id: str,
    payee_name: str,
    amount: float,
    note: str = "Payment",
) -> str:
    """Generate a UPI deep link that opens GPay/PhonePe/Paytm."""
    return (
        f"upi://pay?"
        f"pa={quote(upi_id)}"
        f"&pn={quote(payee_name)}"
        f"&am={amount:.2f}"
        f"&cu=INR"
        f"&tn={quote(note)}"
    )
