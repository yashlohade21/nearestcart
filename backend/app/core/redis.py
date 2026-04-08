import json
from typing import Any

import redis.asyncio as aioredis

from app.core.config import settings

_redis = None


async def get_redis() -> aioredis.Redis | None:
    global _redis
    if not settings.REDIS_URL:
        return None
    if _redis is None:
        _redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis


async def cache_get(key: str) -> Any | None:
    r = await get_redis()
    if not r:
        return None
    try:
        val = await r.get(key)
        return json.loads(val) if val else None
    except Exception:
        return None


async def cache_set(key: str, value: Any, ttl: int = 300):
    r = await get_redis()
    if not r:
        return
    try:
        await r.set(key, json.dumps(value, default=str), ex=ttl)
    except Exception:
        pass


async def cache_delete(pattern: str):
    r = await get_redis()
    if not r:
        return
    try:
        keys = []
        async for key in r.scan_iter(match=pattern):
            keys.append(key)
        if keys:
            await r.delete(*keys)
    except Exception:
        pass
