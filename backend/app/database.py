from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

from app.config import settings
from app.models.base import Base

# Configure SQLite thread safety for development
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=(settings.ENVIRONMENT == "development"),
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def ensure_schema_compatibility(db_engine) -> None:
    """
    Strictly additive and idempotent schema migration helper for SQLite.
    Checks table columns and applies ALTER TABLE statements for any newly added Phase 5 columns.
    """
    with db_engine.connect() as conn:
        # Check learner_stats table
        try:
            res = conn.execute(text("PRAGMA table_info(learner_stats);")).fetchall()
            existing_cols = {row[1] for row in res}
            if "streak_freeze_count" not in existing_cols and "id" in existing_cols:
                conn.execute(
                    text("ALTER TABLE learner_stats ADD COLUMN streak_freeze_count INTEGER NOT NULL DEFAULT 0;")
                )
                conn.commit()
        except Exception:
            pass

        # Check achievements table
        try:
            res = conn.execute(text("PRAGMA table_info(achievements);")).fetchall()
            existing_cols = {row[1] for row in res}
            if "reward_gems" not in existing_cols and "id" in existing_cols:
                conn.execute(
                    text("ALTER TABLE achievements ADD COLUMN reward_gems INTEGER NOT NULL DEFAULT 10;")
                )
                conn.commit()
        except Exception:
            pass


# Execute safe compatibility check
ensure_schema_compatibility(engine)


def get_db() -> Generator[Session, None, None]:
    """Database session dependency for FastAPI routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


__all__ = ["engine", "SessionLocal", "Base", "get_db", "ensure_schema_compatibility"]
