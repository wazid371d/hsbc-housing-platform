"""Application configuration via environment variables."""
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# services/ml-api/  (two levels up from this file: app/config.py -> app -> ml-api)
SERVICE_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="ML_API_", env_file=".env", extra="ignore")

    app_name: str = "Housing Price Prediction API"
    app_version: str = "1.0.0"

    # Where the trained pipeline + metrics are persisted.
    artifacts_dir: Path = SERVICE_ROOT / "artifacts"
    model_filename: str = "model.pkl"
    metrics_filename: str = "metrics.json"

    # Optional explicit override (set in Docker via ML_API_DATASET_PATH).
    dataset_path_override: Path | None = None
    dataset_filename: str = "house_price_dataset.csv"

    @property
    def model_path(self) -> Path:
        return self.artifacts_dir / self.model_filename

    @property
    def metrics_path(self) -> Path:
        return self.artifacts_dir / self.metrics_filename

    @property
    def dataset_path(self) -> Path:
        """Resolve the dataset across layouts.

        Order: explicit override -> service-local data/ (Docker image) ->
        repo-root data/ (local checkout). Returns the first that exists, else the
        repo-root default so error messages point somewhere sensible.
        """
        candidates: list[Path] = []
        if self.dataset_path_override is not None:
            candidates.append(self.dataset_path_override)
        candidates.append(SERVICE_ROOT / "data" / self.dataset_filename)
        candidates.append(SERVICE_ROOT.parent.parent / "data" / self.dataset_filename)
        for candidate in candidates:
            if candidate.exists():
                return candidate
        return candidates[-1]


settings = Settings()
