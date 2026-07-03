"""BFF configuration."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="BFF_", env_file=".env", extra="ignore")

    app_name: str = "Property Value Estimator BFF"
    app_version: str = "1.0.0"

    # Base URL of the Task 1 ML API. Overridden in Docker/Render via env.
    ml_api_url: str = "http://localhost:8000"
    ml_api_timeout_seconds: float = 10.0
    # Optional shared secret forwarded to the ML API as X-API-Key (when the ML API enforces it).
    ml_api_key: str | None = None

    # Allowed CORS origins for the Next.js portal (used if the browser calls the BFF directly).
    cors_origins: list[str] = ["http://localhost:3000"]


settings = Settings()
