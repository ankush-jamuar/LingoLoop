from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
)
from sqlalchemy.orm import relationship

from app.models.base import Base


class AttemptStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    ABANDONED = "abandoned"


class LessonAttempt(Base):
    __tablename__ = "lesson_attempts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(30), nullable=False, default=AttemptStatus.IN_PROGRESS.value, index=True)
    score = Column(Integer, nullable=False, default=0)
    xp_earned = Column(Integer, nullable=False, default=0)
    hearts_lost = Column(Integer, nullable=False, default=0)
    started_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="attempts")
    lesson = relationship("Lesson", back_populates="attempts")
    exercise_attempts = relationship(
        "ExerciseAttempt",
        back_populates="lesson_attempt",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"<LessonAttempt(id={self.id}, user_id={self.user_id}, lesson_id={self.lesson_id}, "
            f"status='{self.status}', score={self.score})>"
        )


class ExerciseAttempt(Base):
    __tablename__ = "exercise_attempts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    lesson_attempt_id = Column(
        Integer,
        ForeignKey("lesson_attempts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    exercise_id = Column(Integer, ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False, index=True)
    answer = Column(JSON, nullable=True)
    is_correct = Column(Boolean, nullable=False, default=False)
    attempt_number = Column(Integer, nullable=False, default=1)
    xp_earned = Column(Integer, nullable=False, default=0)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    lesson_attempt = relationship("LessonAttempt", back_populates="exercise_attempts")
    exercise = relationship("Exercise", back_populates="attempts")

    def __repr__(self) -> str:
        return (
            f"<ExerciseAttempt(id={self.id}, attempt_id={self.lesson_attempt_id}, "
            f"exercise_id={self.exercise_id}, correct={self.is_correct})>"
        )


__all__ = ["AttemptStatus", "LessonAttempt", "ExerciseAttempt"]
