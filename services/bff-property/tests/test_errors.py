"""Error-translation and passthrough tests for the BFF (ML client stubbed)."""
from fastapi import HTTPException
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


def test_estimate_surfaces_upstream_error(monkeypatch):
    async def fail_predict(items):
        raise HTTPException(status_code=503, detail="ML API is unreachable")

    monkeypatch.setattr(ml_client_module.ml_client, "predict", fail_predict)

    with TestClient(app) as client:
        resp = client.post("/api/estimate", json={"items": [SAMPLE]})
        assert resp.status_code != 200
        assert resp.status_code == 503
        assert resp.json()["detail"] == "ML API is unreachable"


def test_model_info_passthrough(monkeypatch):
    payload = {
        "model_type": "StandardScaler + RidgeCV",
        "features": ["square_footage", "bedrooms"],
        "metrics": {"cv_r2": 0.95},
        "model_version": "1.0.0",
    }

    async def fake_model_info():
        return payload

    monkeypatch.setattr(ml_client_module.ml_client, "model_info", fake_model_info)

    with TestClient(app) as client:
        resp = client.get("/api/model-info")
        assert resp.status_code == 200
        assert resp.json() == payload
