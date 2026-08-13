from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    avatar_key = Column(String(50), nullable=False, default="milo_default")
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    stats = relationship(
        "LearnerStats",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    skill_progress = relationship(
        "UserSkillProgress",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    attempts = relationship(
        "LessonAttempt",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    daily_activities = relationship(
        "DailyActivity",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    achievements = relationship(
        "UserAchievement",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, name='{self.name}', email='{self.email}')>"


class LearnerStats(Base):
    __tablename__ = "learner_stats"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    total_xp = Column(Integer, nullable=False, default=0)
    current_streak = Column(Integer, nullable=False, default=0)
    longest_streak = Column(Integer, nullable=False, default=0)
    hearts = Column(Integer, nullable=False, default=5)
    max_hearts = Column(Integer, nullable=False, default=5)
    gems = Column(Integer, nullable=False, default=0)
    daily_goal_xp = Column(Integer, nullable=False, default=30)
    last_activity_at = Column(DateTime(timezone=True), nullable=True)
    hearts_updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user = relationship("User", back_populates="stats")

    def __repr__(self) -> str:
        return f"<LearnerStats(user_id={self.user_id}, xp={self.total_xp}, streak={self.current_streak}, hearts={self.hearts})>"


__all__ = ["User", "LearnerStats"]
