from __future__ import annotations

from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

bearer_scheme = HTTPBearer()


async def verify_firebase_token(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict[str, Any]:
    """Verify a Firebase ID token from the Authorization header.

    This is a placeholder implementation. In production, initialise the
    Firebase Admin SDK and call ``firebase_admin.auth.verify_id_token``.

    Returns a dict representing the decoded token claims.
    """
    token = credentials.credentials

    # TODO: Replace with real Firebase verification:
    #   import firebase_admin
    #   from firebase_admin import auth as firebase_auth
    #   decoded = firebase_auth.verify_id_token(token)
    #   return decoded

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing authentication token",
        )

    # Stub: return a fake decoded token for development
    return {
        "uid": "dev-uid-placeholder",
        "phone_number": "+910000000000",
    }
