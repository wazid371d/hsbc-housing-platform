"""Tests for the optional API-key auth and rate limiting on guarded endpoints."""
from fastapi.testclient import TestClient

from app import security
from app.config import settings
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


def test_api_key_enforced_when_configured(monkeypatch):
    monkeypatch.setattr(settings, "api_key", "secret-key")
    security._hits.clear()
    with TestClient(app) as client:
        # No key -> rejected.
        assert client.post("/predict", json={"items": [SAMPLE]}).status_code == 401
        # Wrong key -> rejected.
        assert (
            client.post("/predict", json={"items": [SAMPLE]}, headers={"X-API-Key": "nope"}).status_code
            == 401
        )
        # Correct key -> allowed.
        ok = client.post("/predict", json={"items": [SAMPLE]}, headers={"X-API-Key": "secret-key"})
        assert ok.status_code == 200
        # model-info is guarded too.
        assert client.get("/model-info").status_code == 401
        assert client.get("/model-info", headers={"X-API-Key": "secret-key"}).status_code == 200


def test_health_open_even_with_api_key(monkeypatch):
    monkeypatch.setattr(settings, "api_key", "secret-key")
    with TestClient(app) as client:
        assert client.get("/health").status_code == 200


def test_fail_closed_rejects_when_key_required_but_missing(monkeypatch):
    # require_key=True but no key configured -> endpoints refuse to serve (503).
    monkeypatch.setattr(settings, "api_key", None)
    monkeypatch.setattr(settings, "require_key", True)
    security._hits.clear()
    with TestClient(app) as client:
        assert client.post("/predict", json={"items": [SAMPLE]}).status_code == 503
        assert client.get("/model-info").status_code == 503
        # /health stays open even in fail-closed mode.
        assert client.get("/health").status_code == 200


def test_fail_closed_with_key_configured_behaves_like_normal(monkeypatch):
    # With a key configured, require_key adds nothing: valid key works, missing key -> 401.
    monkeypatch.setattr(settings, "api_key", "secret-key")
    monkeypatch.setattr(settings, "require_key", True)
    security._hits.clear()
    with TestClient(app) as client:
        assert client.post("/predict", json={"items": [SAMPLE]}).status_code == 401
        ok = client.post("/predict", json={"items": [SAMPLE]}, headers={"X-API-Key": "secret-key"})
        assert ok.status_code == 200


def test_rate_limit_returns_429(monkeypatch):
    monkeypatch.setattr(settings, "api_key", None)  # isolate the rate-limit behaviour
    monkeypatch.setattr(settings, "rate_limit_per_minute", 2)
    security._hits.clear()
    with TestClient(app) as client:
        assert client.post("/predict", json={"items": [SAMPLE]}).status_code == 200
        assert client.post("/predict", json={"items": [SAMPLE]}).status_code == 200
        resp = client.post("/predict", json={"items": [SAMPLE]})
        assert resp.status_code == 429
        assert "Retry-After" in resp.headers
