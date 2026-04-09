from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Scan Pipeline"
    app_env: str = "dev"
    database_url: str = "postgresql+psycopg2://scan:scan@postgres:5432/scan_db"
    redis_url: str = "redis://redis:6379/0"
    artifacts_dir: str = "/app/artifacts"
    cors_origins: str = "http://localhost:5173"
    internal_web_host: str = "backend"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
