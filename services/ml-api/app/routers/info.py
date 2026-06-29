"""Model info endpoint — coefficients and performance metrics."""
from fastapi import APIRouter, HTTPException, Request

from app.model import MODEL_TYPE, TARGET, TrainedModel
from app.schemas import FEATURE_NAMES, ModelInfoResponse

router = APIRouter(tags=["model-info"])


def _get_model(request: Request) -> TrainedModel:
    model = getattr(request.app.state, "model", None)
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded")
    return model


@router.get("/model-info", response_model=ModelInfoResponse)
def model_info(request: Request) -> ModelInfoResponse:
    model = _get_model(request)
    return ModelInfoResponse(
        model_type=MODEL_TYPE,
        target=TARGET,
        features=FEATURE_NAMES,
        intercept=round(model.intercept_in_raw_space(), 4),
        coefficients={k: round(v, 4) for k, v in model.coefficients().items()},
        raw_coefficients={k: round(v, 4) for k, v in model.raw_coefficients().items()},
        metrics={k: round(v, 4) for k, v in model.metrics.items()},
        n_samples=model.n_samples,
        trained_at=model.trained_at,
        model_version=model.model_version,
    )
