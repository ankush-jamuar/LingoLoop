from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.models.base import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    source_language = Column(String(50), nullable=False)
    target_language = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, nullable=False, default=0, index=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    units = relationship(
        "Unit",
        back_populates="course",
        cascade="all, delete-orphan",
        order_by="Unit.order_index",
    )

    def __repr__(self) -> str:
        return f"<Course(id={self.id}, name='{self.name}', target='{self.target_language}')>"


class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, autoincrement=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, nullable=False, default=0, index=True)

    __table_args__ = (
        UniqueConstraint("course_id", "order_index", name="uq_unit_course_order"),
    )

    # Relationships
    course = relationship("Course", back_populates="units")
    skills = relationship(
        "Skill",
        back_populates="unit",
        cascade="all, delete-orphan",
        order_by="Skill.order_index",
    )

    def __repr__(self) -> str:
        return f"<Unit(id={self.id}, title='{self.title}', order={self.order_index})>"


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, autoincrement=True)
    unit_id = Column(Integer, ForeignKey("units.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(100), nullable=False)
    subtitle = Column(String(150), nullable=True)
    description = Column(Text, nullable=True)
    icon_key = Column(String(50), nullable=False, default="sparkles")
    order_index = Column(Integer, nullable=False, default=0, index=True)
    xp_reward = Column(Integer, nullable=False, default=20)
    is_locked_by_default = Column(Boolean, nullable=False, default=True)

    __table_args__ = (
        UniqueConstraint("unit_id", "order_index", name="uq_skill_unit_order"),
    )

    # Relationships
    unit = relationship("Unit", back_populates="skills")
    lessons = relationship(
        "Lesson",
        back_populates="skill",
        cascade="all, delete-orphan",
        order_by="Lesson.order_index",
    )
    user_progress = relationship(
        "UserSkillProgress",
        back_populates="skill",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Skill(id={self.id}, title='{self.title}', order={self.order_index})>"


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, autoincrement=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(100), nullable=False)
    order_index = Column(Integer, nullable=False, default=0, index=True)
    xp_reward = Column(Integer, nullable=False, default=10)

    __table_args__ = (
        UniqueConstraint("skill_id", "order_index", name="uq_lesson_skill_order"),
    )

    # Relationships
    skill = relationship("Skill", back_populates="lessons")
    exercises = relationship(
        "Exercise",
        back_populates="lesson",
        cascade="all, delete-orphan",
        order_by="Exercise.order_index",
    )
    attempts = relationship("LessonAttempt", back_populates="lesson", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Lesson(id={self.id}, title='{self.title}', order={self.order_index})>"


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, autoincrement=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(30), nullable=False, index=True)
    prompt = Column(String(255), nullable=False)
    instruction = Column(String(255), nullable=True)
    content = Column(JSON, nullable=False)
    order_index = Column(Integer, nullable=False, default=0, index=True)
    xp_reward = Column(Integer, nullable=False, default=2)

    __table_args__ = (
        UniqueConstraint("lesson_id", "order_index", name="uq_exercise_lesson_order"),
    )

    # Relationships
    lesson = relationship("Lesson", back_populates="exercises")
    attempts = relationship("ExerciseAttempt", back_populates="exercise", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Exercise(id={self.id}, type='{self.type}', order={self.order_index})>"


__all__ = ["Course", "Unit", "Skill", "Lesson", "Exercise"]
