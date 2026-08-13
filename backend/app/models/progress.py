from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.models.base import Base


class SkillStatus(str, Enum):
    LOCKED = "locked"
    UNLOCKED = "unlocked"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    MASTERED = "mastered"


class UserSkillProgress(Base):
    __tablename__ = "user_skill_progress"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(30), nullable=False, default=SkillStatus.LOCKED.value, index=True)
    is_unlocked = Column(Boolean, nullable=False, default=False, index=True)
    completed = Column(Boolean, nullable=False, default=False)
    crown_level = Column(Integer, nullable=False, default=0)
    xp_earned = Column(Integer, nullable=False, default=0)
    lessons_completed = Column(Integer, nullable=False, default=0)
    last_practiced_at = Column(DateTime(timezone=True), nullable=True)
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

    __table_args__ = (
        UniqueConstraint("user_id", "skill_id", name="uq_user_skill"),
    )

    # Relationships
    user = relationship("User", back_populates="skill_progress")
    skill = relationship("Skill", back_populates="user_progress")

    def __repr__(self) -> str:
        return (
            f"<UserSkillProgress(user_id={self.user_id}, skill_id={self.skill_id}, "
            f"status='{self.status}', crown={self.crown_level})>"
        )


class DailyActivity(Base):
    __tablename__ = "daily_activities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_date = Column(Date, nullable=False, index=True)
    xp_earned = Column(Integer, nullable=False, default=0)
    lessons_completed = Column(Integer, nullable=False, default=0)
    minutes_practiced = Column(Integer, nullable=False, default=0)
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        UniqueConstraint("user_id", "activity_date", name="uq_user_daily_activity"),
    )

    # Relationships
    user = relationship("User", back_populates="daily_activities")

    def __repr__(self) -> str:
        return (
            f"<DailyActivity(user_id={self.user_id}, date={self.activity_date}, "
            f"xp={self.xp_earned}, lessons={self.lessons_completed})>"
        )


__all__ = ["SkillStatus", "UserSkillProgress", "DailyActivity"]
