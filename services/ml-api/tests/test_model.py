"""Unit tests for app.model (exercised directly, not via HTTP)."""
import pytest

from app import model as model_module
from app.config import settings
from app.schemas import FEATURE_NAMES

# Canonical in-range feature row (mid-size home well inside the training domain).
IN_RANGE = [1550, 3, 2, 1997, 6800, 4.1, 7.6]


@pytest.fixture(scope="module")
def trained():
    return model_module.train_from_csv(settings.dataset_path)


def test_train_returns_strong_model(trained):
    assert isinstance(trained, model_module.TrainedModel)
    assert trained.n_samples >= 50
    # Tiny, strongly-linear dataset -> high cross-validated fit.
    assert trained.metrics["cv_r2"] > 0.9


def test_coefficients_cover_all_features(trained):
    coefs = trained.coefficients()
    assert set(coefs.keys()) == set(FEATURE_NAMES)
    assert all(isinstance(v, float) for v in coefs.values())


def test_is_out_of_range_flags_extrapolation(trained):
    assert trained.is_out_of_range(IN_RANGE) is False
    # square_footage far beyond the training maximum.
    out_of_range = [50_000, 3, 2, 1997, 6800, 4.1, 7.6]
    assert trained.is_out_of_range(out_of_range) is True


def test_predict_returns_one_value_per_row(trained):
    rows = [IN_RANGE, [2200, 4, 2.5, 2008, 9600, 7.0, 8.8]]
    preds = trained.predict(rows)
    assert len(preds) == len(rows)
    assert all(isinstance(float(p), float) for p in preds)


def test_save_load_roundtrip(trained, tmp_path):
    model_path = tmp_path / "model.pkl"
    metrics_path = tmp_path / "metrics.json"
    model_module.save(trained, model_path, metrics_path)
    assert model_path.exists()
    assert metrics_path.exists()

    loaded = model_module.load(model_path)
    assert loaded.coefficients() == trained.coefficients()
    assert loaded.predict([IN_RANGE])[0] == pytest.approx(trained.predict([IN_RANGE])[0])
