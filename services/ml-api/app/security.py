"""Lightweight API-key auth and per-client rate limiting.

Both guards are opt-in and fail-open on configuration:
  * API key is enforced only when `settings.api_key` is set.
  * Rate limiting is disabled when `settings.rate_limit_per_minute <= 0`.

The rate limiter is a per-process in-memory sliding window — fine for a single
instance / demo. Behind multiple replicas you would move this to a shared store (Redis).
"""
from __future__ import annotations

import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

from app.config import settings

API_KEY_HEADER = "X-API-Key"
_WINDOW_SECONDS = 60.0

# client-id -> timestamps of recent requests (monotonic seconds)
_hits: dict[str, deque[float]] = defaultdict(deque)


def require_api_key(request: Request) -> None:
    """Reject requests without a valid X-API-Key when a key is configured."""
    if not settings.api_key:
        return  # auth disabled
    provided = request.headers.get(API_KEY_HEADER)
    if not provided or provided != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid API key",
            headers={"WWW-Authenticate": "ApiKey"},
        )


def rate_limit(request: Request) -> None:
    """Sliding-window limit keyed by API key (if present) else client IP."""
    limit = settings.rate_limit_per_minute
    if limit <= 0:
        return  # limiting disabled

    key = request.headers.get(API_KEY_HEADER) or (request.client.host if request.client else "unknown")
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


# Combined dependency for guarded endpoints: auth first, then rate limit.
def guard(request: Request) -> None:
    require_api_key(request)
    rate_limit(request)
