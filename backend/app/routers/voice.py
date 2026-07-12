"""
Voice parsing via Google Gemini.

Accepts a raw speech transcript (Hindi/Hinglish/English) and uses Gemini
to extract structured deal fields: farmer name, buyer name, product,
quantity, unit, buy rate, sell rate.
"""

import json
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/voice", tags=["voice"])

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.5-flash-lite:generateContent"
)

PROMPT = """You are a parser for an Indian agricultural middleman (dalla) app.
Extract deal information from this speech transcript.

Transcript: "{transcript}"

The transcript may be in Hindi, Hinglish, or English. It describes a deal where
the dalla buys produce from a farmer and sells it to a buyer.

Extract and return ONLY a JSON object with these fields (all optional, omit if not mentioned):
- farmerName: string (farmer's name, e.g. "Ramesh")
- buyerName: string (buyer's name, e.g. "Balaji")
- productName: string (product in English lowercase, e.g. "tomato", "cotton", "onion")
- quantity: number (numeric value only)
- unit: string (one of: "kg", "quintal", "ton", "bag", "crate", "dozen", "piece")
- buyRate: number (buy rate per unit in rupees)
- sellRate: number (sell rate per unit in rupees)

Common Hindi words:
- "se liya" / "se kharida" = bought from (farmer)
- "ko becha" / "ko diya" = sold to (buyer)
- "kilo" = kg, "quintal" = quintal, "ton" = ton, "bori" = bag
- "rupay" / "rupee" = rupees
- "tamatar" = tomato, "pyaaz" = onion, "aloo" = potato, "kapas" = cotton

Return ONLY valid JSON, no markdown, no explanation."""


class VoiceParseRequest(BaseModel):
    transcript: str = Field(..., min_length=1, max_length=1000)


class VoiceParseResponse(BaseModel):
    farmerName: Optional[str] = None
    buyerName: Optional[str] = None
    productName: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    buyRate: Optional[float] = None
    sellRate: Optional[float] = None


@router.post("/parse", response_model=VoiceParseResponse)
async def parse_voice(
    body: VoiceParseRequest,
    user: User = Depends(get_current_user),
) -> VoiceParseResponse:
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Voice parsing unavailable: GEMINI_API_KEY not configured",
        )

    prompt = PROMPT.format(transcript=body.transcript.strip())
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json",
        },
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{GEMINI_URL}?key={settings.GEMINI_API_KEY}",
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Gemini API error: {e}")

    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        parsed = json.loads(text)
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to parse Gemini response: {e}",
        )

    return VoiceParseResponse(**parsed)
