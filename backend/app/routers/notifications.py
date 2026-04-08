import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.whatsapp import (
    generate_upi_link,
    is_configured as whatsapp_configured,
    send_deal_confirmation,
    send_payment_reminder,
)
from app.models.buyer import Buyer
from app.models.deal import Deal
from app.models.farmer import Farmer
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["notifications"])


class PaymentReminderRequest(BaseModel):
    party_type: str  # "buyer" or "farmer"
    party_id: str
    amount: float
    include_upi_link: bool = True


class DealConfirmationRequest(BaseModel):
    deal_id: str
    send_to: str  # "buyer" or "farmer"


class UpiLinkRequest(BaseModel):
    amount: float
    note: str = "Payment"


class UpiLinkResponse(BaseModel):
    upi_link: str
    upi_id: str


@router.get("/whatsapp/status")
async def whatsapp_status():
    return {"configured": whatsapp_configured()}


@router.post("/upi-link", response_model=UpiLinkResponse)
async def generate_upi_payment_link(
    body: UpiLinkRequest,
    user: User = Depends(get_current_user),
):
    if not user.upi_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="UPI ID not set. Update your profile with a UPI ID first.",
        )
    link = generate_upi_link(
        upi_id=user.upi_id,
        payee_name=user.business_name or user.name,
        amount=body.amount,
        note=body.note,
    )
    return UpiLinkResponse(upi_link=link, upi_id=user.upi_id)


@router.post("/payment-reminder")
async def send_payment_reminder_endpoint(
    body: PaymentReminderRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not whatsapp_configured():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="WhatsApp not configured. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_ID.",
        )

    party_id = uuid.UUID(body.party_id)
    phone = None
    party_name = ""

    if body.party_type == "buyer":
        result = await db.execute(
            select(Buyer).where(Buyer.id == party_id, Buyer.user_id == user.id)
        )
        buyer = result.scalar_one_or_none()
        if not buyer:
            raise HTTPException(status_code=404, detail="Buyer not found")
        phone = buyer.phone
        party_name = buyer.name
    elif body.party_type == "farmer":
        result = await db.execute(
            select(Farmer).where(Farmer.id == party_id, Farmer.user_id == user.id)
        )
        farmer = result.scalar_one_or_none()
        if not farmer:
            raise HTTPException(status_code=404, detail="Farmer not found")
        phone = farmer.phone
        party_name = farmer.name
    else:
        raise HTTPException(status_code=400, detail="party_type must be 'buyer' or 'farmer'")

    if not phone:
        raise HTTPException(status_code=400, detail=f"{party_name} has no phone number")

    upi_link = None
    if body.include_upi_link and user.upi_id and body.party_type == "buyer":
        upi_link = generate_upi_link(
            upi_id=user.upi_id,
            payee_name=user.business_name or user.name,
            amount=body.amount,
            note=f"Payment to {user.business_name or user.name}",
        )

    dalla_name = user.business_name or user.name
    success = await send_payment_reminder(phone, party_name, body.amount, dalla_name, upi_link)

    if not success:
        raise HTTPException(status_code=500, detail="Failed to send WhatsApp message")

    return {"message": "Payment reminder sent", "phone": phone, "upi_link": upi_link}


@router.post("/deal-confirmation")
async def send_deal_confirmation_endpoint(
    body: DealConfirmationRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not whatsapp_configured():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="WhatsApp not configured.",
        )

    deal_id = uuid.UUID(body.deal_id)
    result = await db.execute(
        select(Deal).where(Deal.id == deal_id, Deal.user_id == user.id)
    )
    deal = result.scalar_one_or_none()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    if body.send_to == "buyer" and deal.buyer_id:
        buyer_result = await db.execute(select(Buyer).where(Buyer.id == deal.buyer_id))
        buyer = buyer_result.scalar_one_or_none()
        if not buyer or not buyer.phone:
            raise HTTPException(status_code=400, detail="Buyer has no phone number")
        phone = buyer.phone
        party_name = buyer.name
        rate = float(deal.sell_rate) if deal.sell_rate else 0
        total = float(deal.quantity) * rate
    elif body.send_to == "farmer" and deal.farmer_id:
        farmer_result = await db.execute(select(Farmer).where(Farmer.id == deal.farmer_id))
        farmer = farmer_result.scalar_one_or_none()
        if not farmer or not farmer.phone:
            raise HTTPException(status_code=400, detail="Farmer has no phone number")
        phone = farmer.phone
        party_name = farmer.name
        rate = float(deal.buy_rate)
        total = float(deal.quantity) * rate
    else:
        raise HTTPException(status_code=400, detail="Invalid send_to or missing party")

    # Get product name
    product_name = "Unknown"
    if deal.product_id:
        from app.models.product import Product
        prod_result = await db.execute(select(Product).where(Product.id == deal.product_id))
        prod = prod_result.scalar_one_or_none()
        if prod:
            product_name = prod.name

    dalla_name = user.business_name or user.name
    success = await send_deal_confirmation(
        phone, party_name, product_name,
        float(deal.quantity), deal.unit, rate, total, dalla_name,
    )

    if not success:
        raise HTTPException(status_code=500, detail="Failed to send WhatsApp message")

    return {"message": "Deal confirmation sent", "phone": phone}
