from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/dalla_deal_tracker"
    SECRET_KEY: str = "change-me-in-production"
    OTP_SECRET: str = "change-me-otp-secret"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"

    # Dev mode — set to false in production
    DEV_MODE: bool = True

    # MSG91 SMS OTP
    MSG91_AUTH_KEY: str = ""
    MSG91_TEMPLATE_ID: str = ""

    # AWS S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET: str = "dalla-photos"
    AWS_REGION: str = "ap-south-1"

    # WhatsApp (Meta Cloud API)
    WHATSAPP_TOKEN: str = ""
    WHATSAPP_PHONE_ID: str = ""

    # Firebase Cloud Messaging
    FCM_SERVER_KEY: str = ""

    # Sentry
    SENTRY_DSN: str = ""

    # CORS — comma-separated origins (use * for dev)
    CORS_ORIGINS: str = "*"

    # Redis — caching and background jobs (leave empty to disable)
    REDIS_URL: str = ""

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
