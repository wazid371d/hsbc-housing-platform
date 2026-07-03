"""Housing Price Prediction API.

Loads a persisted model.pkl at startup for fast, deterministic boot. If the artifact is
missing (e.g. first run before training), it trains on the dataset on the fly so the
service never fails to start.
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import model as model_module
from app.config import settings
from app.routers import health, info, predict
from app.security import guard

logger = logging.getLogger("ml-api")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.model_path.exists():
        logger.info("Loading model artifact from %s", settings.model_path)
        app.state.model = model_module.load(settings.model_path)
    elif settings.dataset_path.exists():
        logger.warning(
            "No model artifact at %s; training on the fly from %s",
            settings.model_path,
            settings.dataset_path,
        )
        app.state.model = model_module.train_from_csv(
            settings.dataset_path, version=settings.app_version
        )
    else:
        logger.error(
            "Neither model artifact (%s) nor dataset (%s) found; /predict will return 503",
            settings.model_path,
            settings.dataset_path,
        )
        app.state.model = None
    yield
    app.state.model = None


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Predicts housing prices from property features using a "
        "StandardScaler + LinearRegression pipeline trained with scikit-learn."
    ),
    lifespan=lifespan,
)

# The API is called server-to-server (BFF, Java) and serves its own Swagger same-origin,
# so CORS is restricted to an explicit allowlist rather than "*".
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-API-Key"],
)

# /health stays open (used by container/orchestrator probes); /predict and /model-info
# are guarded by optional API key + rate limiting.
app.include_router(health.router)
app.include_router(predict.router, dependencies=[Depends(guard)])
app.include_router(info.router, dependencies=[Depends(guard)])


@app.get("/", include_in_schema=False)
def root() -> dict[str, str]:
    return {"service": settings.app_name, "docs": "/docs", "health": "/health"}
