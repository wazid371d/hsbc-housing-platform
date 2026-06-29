"""Thin async client for the Task 1 ML API with error translation."""
from __future__ import annotations

import httpx
from fastapi import HTTPException

from app.config import settings


class MLClient:
    def __init__(self, base_url: str, timeout: float) -> None:
        self._client = httpx.AsyncClient(base_url=base_url, timeout=timeout)

    async def aclose(self) -> None:
        await self._client.aclose()

    async def predict(self, items: list[dict]) -> dict:
        return await self._post("/predict", {"items": items})

    async def model_info(self) -> dict:
        try:
            resp = await self._client.get("/model-info")
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as exc:
            raise HTTPException(status_code=502, detail=f"ML API model-info error: {exc.response.text}")
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="ML API is unreachable")

    async def health_ok(self) -> bool:
        try:
            resp = await self._client.get("/health")
            return resp.status_code == 200 and resp.json().get("model_loaded", False)
        except httpx.RequestError:
            return False

    async def _post(self, path: str, payload: dict) -> dict:
        try:
            resp = await self._client.post(path, json=payload)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as exc:
            # Surface validation errors (422) and other upstream failures meaningfully.
            status = exc.response.status_code
            detail = exc.response.json() if "application/json" in exc.response.headers.get("content-type", "") else exc.response.text
            raise HTTPException(status_code=502 if status >= 500 else status, detail=detail)
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="ML API is unreachable")


# Module-level singleton, lifecycle managed by the app lifespan.
ml_client = MLClient(settings.ml_api_url, settings.ml_api_timeout_seconds)
