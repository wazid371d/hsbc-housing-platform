"""Property Value Estimator BFF.

Backend-for-frontend for App 1. Validates property form submissions, forwards them to the
Task 1 ML API, and translates upstream errors. The browser talks only to this service (or
to Next.js route handlers that proxy here), never to the ML API directly.
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.ml_client import ml_client
from app.schemas import EstimateRequest, EstimateResponse, HealthResponse

logger = logging.getLogger("bff-property")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("BFF starting; ML API at %s", settings.ml_api_url)
    yield
    await ml_client.aclose()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Validates property form input and proxies predictions to the housing ML API.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/estimate", response_model=EstimateResponse, tags=["estimate"])
async def estimate(payload: EstimateRequest) -> EstimateResponse:
    """Estimate the price of one or many properties (single = list of length 1)."""
    items = [item.model_dump() for item in payload.items]
    result = await ml_client.predict(items)
    return EstimateResponse(**result)


@app.get("/api/model-info", tags=["estimate"])
async def model_info() -> dict:
    """Pass-through of the ML model metadata so the UI can show coefficients/metrics."""
    return await ml_client.model_info()


@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health() -> HealthResponse:
    ok = await ml_client.health_ok()
    return HealthResponse(status="ok", ml_api="ok" if ok else "unreachable")


@app.get("/", include_in_schema=False)
def root() -> dict[str, str]:
    return {"service": settings.app_name, "docs": "/docs"}
