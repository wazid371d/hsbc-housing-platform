"""API tests using FastAPI's TestClient (exercises the lifespan model load/train)."""
from fastapi.testclient import TestClient

from app.main import app
from app.schemas import FEATURE_NAMES

SAMPLE = {
    "square_footage": 1550,
    "bedrooms": 3,
    "bathrooms": 2,
    "year_built": 1997,
    "lot_size": 6800,
    "distance_to_city_center": 4.1,
    "school_rating": 7.6,
}


def test_health():
    with TestClient(app) as client:
        resp = client.get("/health")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "ok"
        assert body["model_loaded"] is True


def test_model_info():
    with TestClient(app) as client:
        resp = client.get("/model-info")
        assert resp.status_code == 200
        body = resp.json()
        assert set(body["features"]) == set(FEATURE_NAMES)
        assert set(body["coefficients"].keys()) == set(FEATURE_NAMES)
        # Tiny linear dataset -> strong cross-validated fit.
        assert body["metrics"]["cv_r2"] > 0.9
        assert body["n_samples"] >= 50


def test_predict_single():
    with TestClient(app) as client:
        resp = client.post("/predict", json={"items": [SAMPLE]})
        assert resp.status_code == 200
        body = resp.json()
        assert len(body["predictions"]) == 1
        pred = body["predictions"][0]
        # Reasonable price for an in-range mid-size home.
        assert 150_000 < pred["predicted_price"] < 350_000
        assert pred["lower_bound"] < pred["predicted_price"] < pred["upper_bound"]
        assert pred["out_of_range"] is False


def test_predict_batch():
    with TestClient(app) as client:
        big = {**SAMPLE, "square_footage": 5000}  # within schema bounds, beyond training range
        resp = client.post("/predict", json={"items": [SAMPLE, big]})
        assert resp.status_code == 200
        preds = resp.json()["predictions"]
        assert len(preds) == 2
        assert preds[1]["out_of_range"] is True


def test_predict_validation_error():
    with TestClient(app) as client:
        bad = {**SAMPLE, "bedrooms": -1}
        resp = client.post("/predict", json={"items": [bad]})
        assert resp.status_code == 422
