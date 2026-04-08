import logging
from datetime import date

import httpx
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.mandi_rate import MandiRate

logger = logging.getLogger(__name__)

# data.gov.in API for current daily prices
DATA_GOV_API = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
# Free API key for data.gov.in (public datasets, no auth needed for small usage)
DATA_GOV_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b"


async def fetch_mandi_rates(
    commodity: str | None = None,
    state: str | None = None,
    limit: int = 100,
) -> list[dict]:
    """Fetch latest mandi rates from data.gov.in API."""
    params = {
        "api-key": DATA_GOV_KEY,
        "format": "json",
        "limit": limit,
        "offset": 0,
    }
    if commodity:
        params["filters[commodity]"] = commodity
    if state:
        params["filters[state]"] = state

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(DATA_GOV_API, params=params)
            resp.raise_for_status()
            data = resp.json()
            records = data.get("records", [])
            return [
                {
                    "product_name": r.get("commodity", ""),
                    "mandi_name": r.get("market", ""),
                    "city": r.get("district", ""),
                    "state": r.get("state", ""),
                    "min_price": float(r["min_price"]) if r.get("min_price") else None,
                    "max_price": float(r["max_price"]) if r.get("max_price") else None,
                    "modal_price": (
                        float(r["modal_price"]) if r.get("modal_price") else None
                    ),
                    "unit": "quintal",
                    "rate_date": r.get("arrival_date", str(date.today())),
                    "source": "data.gov.in",
                }
                for r in records
                if r.get("commodity")
            ]
    except Exception as e:
        logger.error(f"Failed to fetch mandi rates: {e}")
        return []


async def sync_rates_to_db(db: AsyncSession, rates: list[dict]) -> int:
    """Upsert mandi rates into the database. Returns count of new/updated records."""
    if not rates:
        return 0
    count = 0
    for r in rates:
        try:
            # Parse date - could be DD/MM/YYYY or YYYY-MM-DD
            rate_date_str = r["rate_date"]
            if "/" in rate_date_str:
                parts = rate_date_str.split("/")
                rate_date = date(int(parts[2]), int(parts[1]), int(parts[0]))
            else:
                rate_date = date.fromisoformat(rate_date_str)

            stmt = (
                pg_insert(MandiRate)
                .values(
                    product_name=r["product_name"],
                    mandi_name=r["mandi_name"],
                    city=r["city"],
                    state=r["state"],
                    min_price=r["min_price"],
                    max_price=r["max_price"],
                    modal_price=r["modal_price"],
                    unit=r["unit"],
                    rate_date=rate_date,
                    source=r["source"],
                )
                .on_conflict_do_update(
                    index_elements=["product_name", "mandi_name", "rate_date"],
                    set_={
                        "min_price": r["min_price"],
                        "max_price": r["max_price"],
                        "modal_price": r["modal_price"],
                    },
                )
            )
            await db.execute(stmt)
            count += 1
        except Exception as e:
            logger.warning(f"Skipping rate record: {e}")
    await db.commit()
    return count
