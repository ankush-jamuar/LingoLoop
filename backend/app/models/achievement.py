from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.models.base import Base


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    icon_key = Column(String(50), nullable=False, default="trophy")
    requirement_type = Column(String(50), nullable=False)
    requirement_value = Column(Integer, nullable=False, default=1)
    reward_gems = Column(Integer, nullable=False, default=10)

    # Relationships
    user_achievements = relationship(
        "UserAchievement",
        back_populates="achievement",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Achievement(id={self.id}, key='{self.key}', title='{self.title}')>"


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    achievement_id = Column(
        Integer,
        ForeignKey("achievements.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    unlocked_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),
    )

    # Relationships
    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")

    def __repr__(self) -> str:
        return f"<UserAchievement(user_id={self.user_id}, achievement_id={self.achievement_id})>"


__all__ = ["Achievement", "UserAchievement"]
