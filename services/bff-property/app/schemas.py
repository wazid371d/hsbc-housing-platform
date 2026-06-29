"""BFF request/response models. Mirrors the ML API contract with the same input bounds
so invalid form submissions are rejected before reaching the model service."""
from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

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

    square_footage: float = Field(gt=0, le=20000)
    bedrooms: int = Field(ge=0, le=20)
    bathrooms: float = Field(ge=0, le=20)
    year_built: int = Field(ge=1800, le=2026)
    lot_size: float = Field(gt=0)
    distance_to_city_center: float = Field(ge=0)
    school_rating: float = Field(ge=0, le=10)


class EstimateRequest(BaseModel):
    """Single or batch: a single estimate is a list of length 1."""

    items: list[PropertyFeatures] = Field(min_length=1, max_length=1000)


class Prediction(BaseModel):
    predicted_price: float
    lower_bound: float
    upper_bound: float
    out_of_range: bool


class EstimateResponse(BaseModel):
    predictions: list[Prediction]
    model_version: str


class HealthResponse(BaseModel):
    status: str
    ml_api: str  # "ok" | "unreachable"
