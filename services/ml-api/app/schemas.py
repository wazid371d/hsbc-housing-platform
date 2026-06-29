"""Pydantic request/response models — the public API contract."""
from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

# Canonical feature order. Shared by the model trainer and the schemas so the
# DataFrame columns always line up with what the pipeline was fitted on.
FEATURE_NAMES: list[str] = [
    "square_footage",
    "bedrooms",
    "bathrooms",
    "year_built",
    "lot_size",
    "distance_to_city_center",
    "school_rating",
]


class PropertyFeatures(BaseModel):
    """A single property's features. Bounds mirror the training data domain."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "square_footage": 1550,
                "bedrooms": 3,
                "bathrooms": 2,
                "year_built": 1997,
                "lot_size": 6800,
                "distance_to_city_center": 4.1,
                "school_rating": 7.6,
            }
        }
    )

    square_footage: float = Field(gt=0, le=20000, description="Living area in square feet")
    bedrooms: int = Field(ge=0, le=20)
    bathrooms: float = Field(ge=0, le=20, description="Fractional allowed, e.g. 2.5")
    year_built: int = Field(ge=1800, le=2026)
    lot_size: float = Field(gt=0, description="Lot area in square feet")
    distance_to_city_center: float = Field(ge=0, description="Miles to city centre")
    school_rating: float = Field(ge=0, le=10)

    def to_row(self) -> list[float]:
        """Return feature values in canonical order."""
        return [getattr(self, name) for name in FEATURE_NAMES]


class PredictRequest(BaseModel):
    """One endpoint serves both single and batch: single = list of length 1."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "items": [
                    {
                        "square_footage": 1550,
                        "bedrooms": 3,
                        "bathrooms": 2,
                        "year_built": 1997,
                        "lot_size": 6800,
                        "distance_to_city_center": 4.1,
                        "school_rating": 7.6,
                    },
                    {
                        "square_footage": 2200,
                        "bedrooms": 4,
                        "bathrooms": 2.5,
                        "year_built": 2008,
                        "lot_size": 9600,
                        "distance_to_city_center": 7.0,
                        "school_rating": 8.8,
                    },
                ]
            }
        }
    )

    items: list[PropertyFeatures] = Field(min_length=1, max_length=1000)


class Prediction(BaseModel):
    predicted_price: float = Field(description="Predicted price in currency units")
    lower_bound: float = Field(description="Predicted price minus one RMSE (approx. confidence band)")
    upper_bound: float = Field(description="Predicted price plus one RMSE")
    out_of_range: bool = Field(
        description="True when any input falls outside the training data range; prediction is an extrapolation"
    )


class PredictResponse(BaseModel):
    predictions: list[Prediction]
    model_version: str


class ModelInfoResponse(BaseModel):
    model_type: str
    target: str
    features: list[str]
    intercept: float
    coefficients: dict[str, float] = Field(description="Coefficients on standardized features (comparable magnitudes)")
    raw_coefficients: dict[str, float] = Field(description="Coefficients expressed per raw feature unit")
    metrics: dict[str, float] = Field(description="r2/rmse/mae for cross-val, holdout, and in-sample")
    n_samples: int
    trained_at: str
    model_version: str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_version: str | None = None
