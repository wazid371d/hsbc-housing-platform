"""Offline trainer: fits the pipeline, prints metrics, and persists model.pkl + metrics.json.

Run from the service root:
    python -m training.train
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

# Allow running as a script (python training/train.py) by ensuring the service root is importable.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import model as model_module  # noqa: E402
from app.config import settings  # noqa: E402


def main() -> None:
    if not settings.dataset_path.exists():
        raise SystemExit(f"Dataset not found at {settings.dataset_path}")

    print(f"Training on {settings.dataset_path} ...")
    trained = model_module.train_from_csv(settings.dataset_path, version=settings.app_version)

    model_module.save(trained, settings.model_path, settings.metrics_path)

    print(f"Saved model   -> {settings.model_path}")
    print(f"Saved metrics -> {settings.metrics_path}")
    print(f"Samples: {trained.n_samples}")
    print("Metrics:")
    print(json.dumps(trained.metrics, indent=2))
    print("Standardized coefficients:")
    print(json.dumps(trained.coefficients(), indent=2))


if __name__ == "__main__":
    main()
