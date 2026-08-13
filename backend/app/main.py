import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import settings
from app.database import engine
from app.routes.api import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("lingoloop")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan context manager for startup and shutdown events."""
    logger.info("Initializing LingoLoop API backend...")
    # Verify database engine connectivity
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        logger.info("Database connection established successfully.")
    except Exception as exc:
        logger.error(f"Database connection error: {exc}")
        raise exc
    yield
    logger.info("Shutting down LingoLoop API backend...")


app = FastAPI(
    title="LingoLoop API",
    description="Backend API service for LingoLoop language learning platform",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(api_router)


@app.get("/")
def root_status() -> dict[str, str]:
    """Root redirect / information endpoint."""
    return {
        "service": settings.APP_NAME,
        "docs": "/docs",
        "health": "/api/health",
    }
