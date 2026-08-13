from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import (
    Course,
    LessonAttempt,
    Skill,
    Unit,
    User,
    UserSkillProgress,
)
from app.schemas.learner import LearnerProfileResponse
from app.schemas.progression import NextLessonResponse


class LearnerService:
    DEFAULT_SEED_EMAIL = "ankush@lingoloop.local"

    @classmethod
    def get_user_by_email_or_default(
        cls, db: Session, email: Optional[str] = None
    ) -> User:
        """Resolves target learner user."""
        target_email = email or cls.DEFAULT_SEED_EMAIL
        stmt = (
            select(User)
            .options(joinedload(User.stats))
            .where(User.email == target_email)
        )
        user = db.scalars(stmt).first()
        if not user:
            stmt_fallback = select(User).options(joinedload(User.stats)).limit(1)
            user = db.scalars(stmt_fallback).first()
        if not user:
            raise ValueError("No learner found in database.")
        return user

    @classmethod
    def get_current_learner(
        cls, db: Session, email: Optional[str] = None
    ) -> Optional[LearnerProfileResponse]:
        """Retrieves active learner profile and associated lifetime stats."""
        target_email = email or cls.DEFAULT_SEED_EMAIL
        stmt = (
            select(User)
            .options(joinedload(User.stats))
            .where(User.email == target_email)
        )
        user = db.scalars(stmt).first()

        # Fallback to the first available user if seed email differs
        if not user:
            stmt_fallback = select(User).options(joinedload(User.stats)).limit(1)
            user = db.scalars(stmt_fallback).first()

        if not user:
            return None

        return LearnerProfileResponse.model_validate(user)

    @classmethod
    def get_next_lesson(cls, db: Session, user_id: int) -> Optional[NextLessonResponse]:
        """Calculates the exact next lesson recommended for the learner based on progression."""
        # 1. Fetch active course hierarchy
        stmt = (
            select(Course)
            .options(
                joinedload(Course.units)
                .joinedload(Unit.skills)
                .joinedload(Skill.lessons)
            )
            .where(Course.is_active == True)
            .order_by(Course.order_index)
        )
        course = db.scalars(stmt).unique().first()
        if not course:
            return None

        # 2. Query user skill progress
        prog_stmt = select(UserSkillProgress).where(UserSkillProgress.user_id == user_id)
        user_progress_list = db.scalars(prog_stmt).all()
        progress_by_skill_id: dict[int, UserSkillProgress] = {
            p.skill_id: p for p in user_progress_list
        }

        # 3. Query completed lesson IDs
        completed_stmt = (
            select(LessonAttempt.lesson_id)
            .where(LessonAttempt.user_id == user_id, LessonAttempt.status == "completed")
            .distinct()
        )
        completed_lesson_ids = set(db.scalars(completed_stmt).all())

        # 4. Search sequentially for the active learning front
        for unit in sorted(course.units, key=lambda u: u.order_index):
            for skill in sorted(unit.skills, key=lambda s: s.order_index):
                user_prog = progress_by_skill_id.get(skill.id)

                is_unlocked = user_prog.is_unlocked if user_prog else not skill.is_locked_by_default
                is_completed = user_prog.completed if user_prog else False
                crown_level = user_prog.crown_level if user_prog else 0
                status = user_prog.status if user_prog else ("unlocked" if is_unlocked else "locked")

                # If this skill is unlocked and not fully completed, find the next uncompleted lesson
                if is_unlocked and not is_completed:
                    for lesson in sorted(skill.lessons, key=lambda l: l.order_index):
                        if lesson.id not in completed_lesson_ids:
                            return NextLessonResponse(
                                course_id=course.id,
                                course_name=course.name,
                                unit_id=unit.id,
                                unit_title=unit.title,
                                skill_id=skill.id,
                                skill_title=skill.title,
                                skill_icon_key=skill.icon_key,
                                lesson_id=lesson.id,
                                lesson_title=lesson.title,
                                lesson_order_index=lesson.order_index,
                                xp_reward=lesson.xp_reward,
                                crown_level=crown_level,
                                skill_status=status,
                            )

        # Fallback: if all skills are completed, return the first lesson of the first skill for review
        if course.units and course.units[0].skills and course.units[0].skills[0].lessons:
            first_unit = course.units[0]
            first_skill = first_unit.skills[0]
            first_lesson = first_skill.lessons[0]
            user_prog = progress_by_skill_id.get(first_skill.id)
            return NextLessonResponse(
                course_id=course.id,
                course_name=course.name,
                unit_id=first_unit.id,
                unit_title=first_unit.title,
                skill_id=first_skill.id,
                skill_title=first_skill.title,
                skill_icon_key=first_skill.icon_key,
                lesson_id=first_lesson.id,
                lesson_title=first_lesson.title,
                lesson_order_index=first_lesson.order_index,
                xp_reward=first_lesson.xp_reward,
                crown_level=user_prog.crown_level if user_prog else 1,
                skill_status=user_prog.status if user_prog else "completed",
            )

        return None
