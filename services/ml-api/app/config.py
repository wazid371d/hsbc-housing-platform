"""Application configuration via environment variables."""
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# services/ml-api/  (two levels up from this file: app/config.py -> app -> ml-api)
SERVICE_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="ML_API_", env_file=".env", extra="ignore")

    app_name: str = "Housing Price Prediction API"
    app_version: str = "1.0.0"

    # --- Security / hardening ---
    # Browser origins allowed by CORS. The API is called server-to-server (BFF, Java) and
    # its own Swagger is same-origin, so this can stay tight. Override via
    # ML_API_ALLOWED_ORIGINS='["https://your-portal"]'.
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "https://hsbc-portal-ilhl.onrender.com",
    ]
    # Optional shared secret. When set, /predict and /model-info require a matching
    # X-API-Key header. Unset (default) → open, so local dev and tests are unaffected.
    # Aliased so the env var is a clean ML_API_KEY (not the prefixed ML_API_API_KEY).
    api_key: str | None = Field(default=None, validation_alias="ML_API_KEY")
    # Fail-closed switch (env ML_API_REQUIRE_KEY). When true, /predict and /model-info are
    # rejected (503) unless a key is configured — so the API is unusable until the secret is
    # deployed. Default false keeps local dev and tests open.
    require_key: bool = False
    # Simple per-client rate limit for /predict and /model-info. 0 disables it.
    rate_limit_per_minute: int = 240

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
