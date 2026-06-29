"""Model training, persistence, metrics, and inference.

The dataset is tiny (~50 rows) and the price signal is strongly linear, so we use a
StandardScaler -> RidgeCV pipeline (L2-regularized linear regression):
  * interpretable coefficients for /model-info (trees give none),
  * no overfitting / no failure to extrapolate that a RandomForest would suffer on 50 rows,
  * Ridge tames the severe multicollinearity in this dataset (all features correlate
    ~0.9-0.99), giving stable, sensibly-signed coefficients where plain OLS does not,
  * RidgeCV picks the regularization strength by cross-validation,
  * stable, fast to load.

Metrics on tiny data: a single holdout split is high variance, so we report 5-fold
cross-validated R2/RMSE/MAE as the primary numbers, alongside a fixed holdout split and
the in-sample fit for reference.
"""
from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import RidgeCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, cross_val_predict, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from app.schemas import FEATURE_NAMES

TARGET = "price"
MODEL_TYPE = "StandardScaler + RidgeCV (L2-regularized linear regression)"

# Candidate regularization strengths for RidgeCV to choose among by cross-validation.
RIDGE_ALPHAS = np.logspace(-2, 4, 50)


@dataclass
class TrainedModel:
    """In-memory bundle: the fitted pipeline plus everything /model-info needs."""

    pipeline: Pipeline
    metrics: dict[str, float]
    feature_ranges: dict[str, dict[str, float]]
    n_samples: int
    trained_at: str
    model_version: str

    # ----- inference -----

    def predict(self, rows: list[list[float]]) -> np.ndarray:
        frame = pd.DataFrame(rows, columns=FEATURE_NAMES)
        return self.pipeline.predict(frame)

    def is_out_of_range(self, row: list[float]) -> bool:
        for name, value in zip(FEATURE_NAMES, row):
            rng = self.feature_ranges[name]
            if value < rng["min"] or value > rng["max"]:
                return True
        return False

    # ----- introspection for /model-info -----

    @property
    def rmse(self) -> float:
        return self.metrics["holdout_rmse"]

    def coefficients(self) -> dict[str, float]:
        reg: RidgeCV = self.pipeline.named_steps["regressor"]
        return {name: float(c) for name, c in zip(FEATURE_NAMES, reg.coef_)}

    def raw_coefficients(self) -> dict[str, float]:
        """Convert standardized coefficients back to per-raw-unit effect: coef / scale."""
        reg: RidgeCV = self.pipeline.named_steps["regressor"]
        scaler: StandardScaler = self.pipeline.named_steps["scaler"]
        return {
            name: float(c / s)
            for name, c, s in zip(FEATURE_NAMES, reg.coef_, scaler.scale_)
        }

    def intercept_in_raw_space(self) -> float:
        """Intercept of the equivalent raw-feature linear model."""
        reg: RidgeCV = self.pipeline.named_steps["regressor"]
        scaler: StandardScaler = self.pipeline.named_steps["scaler"]
        return float(reg.intercept_ - np.sum((reg.coef_ * scaler.mean_) / scaler.scale_))


def _build_pipeline() -> Pipeline:
    return Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            ("regressor", RidgeCV(alphas=RIDGE_ALPHAS)),
        ]
    )


def _metrics(X: pd.DataFrame, y: pd.Series) -> dict[str, float]:
    """Compute cross-validated, holdout, and in-sample metrics."""
    # 5-fold cross-validated predictions (primary, robust on tiny data).
    cv = KFold(n_splits=5, shuffle=True, random_state=42)
    cv_pred = cross_val_predict(_build_pipeline(), X, y, cv=cv)

    # Fixed holdout split for headline numbers shown in the UI.
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)
    holdout = _build_pipeline().fit(X_tr, y_tr)
    holdout_pred = holdout.predict(X_te)

    # In-sample fit for reference.
    full = _build_pipeline().fit(X, y)
    insample_pred = full.predict(X)

    def rmse(a, b) -> float:
        return float(np.sqrt(mean_squared_error(a, b)))

    return {
        "cv_r2": float(r2_score(y, cv_pred)),
        "cv_rmse": rmse(y, cv_pred),
        "cv_mae": float(mean_absolute_error(y, cv_pred)),
        "holdout_r2": float(r2_score(y_te, holdout_pred)),
        "holdout_rmse": rmse(y_te, holdout_pred),
        "holdout_mae": float(mean_absolute_error(y_te, holdout_pred)),
        "insample_r2": float(r2_score(y, insample_pred)),
    }


def train_from_csv(csv_path: Path, version: str = "1.0.0") -> TrainedModel:
    """Train the pipeline on the dataset and bundle metrics + metadata."""
    df = pd.read_csv(csv_path)
    missing = [c for c in FEATURE_NAMES + [TARGET] if c not in df.columns]
    if missing:
        raise ValueError(f"Dataset {csv_path} is missing columns: {missing}")

    X = df[FEATURE_NAMES].astype(float)
    y = df[TARGET].astype(float)

    metrics = _metrics(X, y)

    pipeline = _build_pipeline().fit(X, y)
    feature_ranges = {
        name: {"min": float(X[name].min()), "max": float(X[name].max())}
        for name in FEATURE_NAMES
    }

    return TrainedModel(
        pipeline=pipeline,
        metrics=metrics,
        feature_ranges=feature_ranges,
        n_samples=int(len(df)),
        trained_at=datetime.now(timezone.utc).isoformat(),
        model_version=version,
    )


def save(model: TrainedModel, model_path: Path, metrics_path: Path) -> None:
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, model_path)
    metrics_path.write_text(json.dumps(model.metrics, indent=2))


def load(model_path: Path) -> TrainedModel:
    return joblib.load(model_path)
