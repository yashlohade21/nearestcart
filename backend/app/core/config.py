from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "NearKart"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/nearkart"
    SECRET_KEY: str = "change-me-in-production"
    FIREBASE_CREDENTIALS_PATH: str = "firebase-credentials.json"


settings = Settings()
