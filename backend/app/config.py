from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "lingoloop-api"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "sqlite:///./lingoloop.db"
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    ENABLE_DEV_RESET: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
