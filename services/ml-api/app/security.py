"""API-key auth and per-client rate limiting for guarded endpoints.

Both guards are opt-in and fail-open on configuration:
  * API key is enforced only when `settings.api_key` is set.
  * Rate limiting is disabled when `settings.rate_limit_per_minute <= 0`.

The key is declared via FastAPI's ``APIKeyHeader`` security scheme so it appears in the
OpenAPI spec and Swagger renders an "Authorize" button (paste the key once, Try-it-out works).

The rate limiter is a per-process in-memory sliding window — fine for a single
instance / demo. Behind multiple replicas you would move this to a shared store (Redis).
"""
from __future__ import annotations

import time
from collections import defaultdict, deque

from fastapi import Depends, HTTPException, Request, Security, status
from fastapi.security import APIKeyHeader

from app.config import settings

API_KEY_HEADER = "X-API-Key"
_WINDOW_SECONDS = 60.0

# auto_error=False: a missing header is handled by us (auth is optional unless a key is set),
# not rejected automatically. Declaring it here is what gives Swagger the Authorize button.
api_key_header = APIKeyHeader(name=API_KEY_HEADER, auto_error=False)

# client-id -> timestamps of recent requests (monotonic seconds)
_hits: dict[str, deque[float]] = defaultdict(deque)


def require_api_key(api_key: str | None = Security(api_key_header)) -> None:
    """Reject requests without a valid X-API-Key when a key is configured."""
    if not settings.api_key:
        return  # auth disabled
    if not api_key or api_key != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid API key",
        )


def rate_limit(request: Request, api_key: str | None = Security(api_key_header)) -> None:
    """Sliding-window limit keyed by API key (if present) else client IP."""
    limit = settings.rate_limit_per_minute
    if limit <= 0:
        return  # limiting disabled

    key = api_key or (request.client.host if request.client else "unknown")
    now = time.monotonic()
    bucket = _hits[key]

    # Drop timestamps older than the window.
    cutoff = now - _WINDOW_SECONDS
    while bucket and bucket[0] < cutoff:
        bucket.popleft()

    if len(bucket) >= limit:
        retry_after = max(1, int(_WINDOW_SECONDS - (now - bucket[0])))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded ({limit}/min)",
            headers={"Retry-After": str(retry_after)},
        )
    bucket.append(now)


def guard(
    _auth: None = Depends(require_api_key),
    _rate: None = Depends(rate_limit),
) -> None:
    """Combined dependency for guarded endpoints: auth first, then rate limit."""
    return None
