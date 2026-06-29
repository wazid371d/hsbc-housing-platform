"""BFF tests with the ML client stubbed (no live ML API needed)."""
import pytest
from fastapi.testclient import TestClient

from app import ml_client as ml_client_module
from app.main import app

SAMPLE = {
    "square_footage": 1550,
    "bedrooms": 3,
    "bathrooms": 2,
    "year_built": 1997,
    "lot_size": 6800,
    "distance_to_city_center": 4.1,
    "school_rating": 7.6,
}


@pytest.fixture(autouse=True)
def stub_ml(monkeypatch):
    async def fake_predict(items):
        return {
            "predictions": [
                {"predicted_price": 248000.0, "lower_bound": 240000.0, "upper_bound": 256000.0, "out_of_range": False}
                for _ in items
            ],
            "model_version": "1.0.0",
        }

    async def fake_health_ok():
        return True

    monkeypatch.setattr(ml_client_module.ml_client, "predict", fake_predict)
    monkeypatch.setattr(ml_client_module.ml_client, "health_ok", fake_health_ok)


def test_health():
    with TestClient(app) as client:
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok", "ml_api": "ok"}


def test_estimate_single():
    with TestClient(app) as client:
        resp = client.post("/api/estimate", json={"items": [SAMPLE]})
        assert resp.status_code == 200
        body = resp.json()
        assert len(body["predictions"]) == 1
        assert body["predictions"][0]["predicted_price"] == 248000.0


def test_estimate_validation_error():
    with TestClient(app) as client:
        bad = {**SAMPLE, "school_rating": 99}  # exceeds le=10
        resp = client.post("/api/estimate", json={"items": [bad]})
        assert resp.status_code == 422
