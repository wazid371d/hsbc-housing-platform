"""Prediction endpoint — handles both single and batch requests."""
from fastapi import APIRouter, HTTPException, Request

from app.model import TrainedModel
from app.schemas import PredictRequest, PredictResponse, Prediction

router = APIRouter(tags=["predict"])


def _get_model(request: Request) -> TrainedModel:
    model = getattr(request.app.state, "model", None)
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded")
    return model


@router.post("/predict", response_model=PredictResponse)
def predict(request: Request, payload: PredictRequest) -> PredictResponse:
    """Predict housing prices for one or many properties.

    A single prediction is just a batch of length 1.
    """
    model = _get_model(request)
    rows = [item.to_row() for item in payload.items]
    prices = model.predict(rows)

    predictions = [
        Prediction(
            predicted_price=round(float(price), 2),
            lower_bound=round(float(price) - model.rmse, 2),
            upper_bound=round(float(price) + model.rmse, 2),
            out_of_range=model.is_out_of_range(row),
        )
        for price, row in zip(prices, rows)
    ]
    return PredictResponse(predictions=predictions, model_version=model.model_version)
