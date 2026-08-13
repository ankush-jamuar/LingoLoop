from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import (
    Course,
    Lesson,
    LessonAttempt,
    Skill,
    SkillStatus,
    Unit,
    UserSkillProgress,
)
from app.schemas.course import (
    CourseSummaryResponse,
    LessonSummary,
    LoopMapResponse,
    SkillDetailResponse,
    SkillMapNode,
    UnitMapSection,
)


class CourseService:
    @staticmethod
    def get_active_course(db: Session) -> Optional[Course]:
        """Retrieves the primary active language course."""
        stmt = (
            select(Course)
            .where(Course.is_active == True)
            .order_by(Course.order_index)
            .limit(1)
        )
        return db.scalars(stmt).first()

    @staticmethod
    def get_course_summary(db: Session, course_id: int) -> Optional[CourseSummaryResponse]:
        """Retrieves lightweight summary metadata for a course."""
        course = db.get(Course, course_id)
        if not course:
            return None
        return CourseSummaryResponse.model_validate(course)

    @classmethod
    def get_course_loop_map(
        cls, db: Session, course_id: int, user_id: int
    ) -> Optional[LoopMapResponse]:
        """Builds the complete Loop Map dataset with units, skills, and learner progress."""
        # 1. Eagerly load course hierarchy
        stmt = (
            select(Course)
            .options(
                joinedload(Course.units)
                .joinedload(Unit.skills)
                .joinedload(Skill.lessons)
            )
            .where(Course.id == course_id, Course.is_active == True)
        )
        course = db.scalars(stmt).unique().first()
        if not course:
            return None

        # 2. Query learner's skill progress map
        progress_stmt = select(UserSkillProgress).where(UserSkillProgress.user_id == user_id)
        user_progress_list = db.scalars(progress_stmt).all()
        progress_by_skill_id: dict[int, UserSkillProgress] = {
            p.skill_id: p for p in user_progress_list
        }

        # 3. Query learner's completed distinct lesson IDs
        completed_lessons_stmt = (
            select(LessonAttempt.lesson_id)
            .where(LessonAttempt.user_id == user_id, LessonAttempt.status == "completed")
            .distinct()
        )
        completed_lesson_ids: set[int] = set(db.scalars(completed_lessons_stmt).all())

        # 4. Construct hierarchical Loop Map structure
        unit_sections: list[UnitMapSection] = []
        for unit in sorted(course.units, key=lambda u: u.order_index):
            skill_nodes: list[SkillMapNode] = []
            for skill in sorted(unit.skills, key=lambda s: s.order_index):
                user_prog = progress_by_skill_id.get(skill.id)

                # Determine status & unlock values
                if user_prog:
                    status = user_prog.status
                    is_unlocked = user_prog.is_unlocked
                    completed = user_prog.completed
                    crown_level = user_prog.crown_level
                    lessons_completed = user_prog.lessons_completed
                    xp_earned = user_prog.xp_earned
                else:
                    # Fallback to model defaults if progress not yet seeded
                    is_unlocked = not skill.is_locked_by_default
                    status = SkillStatus.UNLOCKED.value if is_unlocked else SkillStatus.LOCKED.value
                    completed = False
                    crown_level = 0
                    lessons_completed = 0
                    xp_earned = 0

                # Build lesson summaries with completion flags
                lesson_summaries: list[LessonSummary] = []
                for lesson in sorted(skill.lessons, key=lambda l: l.order_index):
                    lesson_summaries.append(
                        LessonSummary(
                            id=lesson.id,
                            skill_id=lesson.skill_id,
                            title=lesson.title,
                            order_index=lesson.order_index,
                            xp_reward=lesson.xp_reward,
                            is_completed=(lesson.id in completed_lesson_ids),
                        )
                    )

                skill_nodes.append(
                    SkillMapNode(
                        id=skill.id,
                        unit_id=skill.unit_id,
                        title=skill.title,
                        subtitle=skill.subtitle,
                        description=skill.description,
                        icon_key=skill.icon_key,
                        order_index=skill.order_index,
                        xp_reward=skill.xp_reward,
                        is_locked_by_default=skill.is_locked_by_default,
                        status=status,
                        is_unlocked=is_unlocked,
                        completed=completed,
                        crown_level=crown_level,
                        lessons_completed=lessons_completed,
                        total_lessons=len(skill.lessons),
                        xp_earned=xp_earned,
                        lessons=lesson_summaries,
                    )
                )

            unit_sections.append(
                UnitMapSection(
                    id=unit.id,
                    course_id=unit.course_id,
                    title=unit.title,
                    description=unit.description,
                    order_index=unit.order_index,
                    skills=skill_nodes,
                )
            )

        return LoopMapResponse(
            course_id=course.id,
            course_name=course.name,
            source_language=course.source_language,
            target_language=course.target_language,
            description=course.description,
            units=unit_sections,
        )

    @classmethod
    def get_skill_detail(
        cls, db: Session, skill_id: int, user_id: int
    ) -> Optional[SkillDetailResponse]:
        """Retrieves comprehensive details for a specific skill node."""
        stmt = (
            select(Skill)
            .options(joinedload(Skill.unit), joinedload(Skill.lessons))
            .where(Skill.id == skill_id)
        )
        skill = db.scalars(stmt).unique().first()
        if not skill:
            return None

        # Query user progress
        prog_stmt = select(UserSkillProgress).where(
            UserSkillProgress.user_id == user_id, UserSkillProgress.skill_id == skill_id
        )
        user_prog = db.scalars(prog_stmt).first()

        # Query completed lessons
        completed_stmt = (
            select(LessonAttempt.lesson_id)
            .where(LessonAttempt.user_id == user_id, LessonAttempt.status == "completed")
            .distinct()
        )
        completed_ids = set(db.scalars(completed_stmt).all())

        if user_prog:
            status = user_prog.status
            is_unlocked = user_prog.is_unlocked
            completed = user_prog.completed
            crown_level = user_prog.crown_level
            lessons_completed = user_prog.lessons_completed
            xp_earned = user_prog.xp_earned
        else:
            is_unlocked = not skill.is_locked_by_default
            status = SkillStatus.UNLOCKED.value if is_unlocked else SkillStatus.LOCKED.value
            completed = False
            crown_level = 0
            lessons_completed = 0
            xp_earned = 0

        lesson_summaries = [
            LessonSummary(
                id=lesson.id,
                skill_id=lesson.skill_id,
                title=lesson.title,
                order_index=lesson.order_index,
                xp_reward=lesson.xp_reward,
                is_completed=(lesson.id in completed_ids),
            )
            for lesson in sorted(skill.lessons, key=lambda l: l.order_index)
        ]

        return SkillDetailResponse(
            id=skill.id,
            unit_id=skill.unit_id,
            unit_title=skill.unit.title if skill.unit else "",
            title=skill.title,
            subtitle=skill.subtitle,
            description=skill.description,
            icon_key=skill.icon_key,
            order_index=skill.order_index,
            xp_reward=skill.xp_reward,
            status=status,
            is_unlocked=is_unlocked,
            completed=completed,
            crown_level=crown_level,
            lessons_completed=lessons_completed,
            total_lessons=len(skill.lessons),
            xp_earned=xp_earned,
            lessons=lesson_summaries,
        )
