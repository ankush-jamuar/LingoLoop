from datetime import datetime, timezone
from typing import Any, Dict
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.models import (
    Course,
    DailyActivity,
    ExerciseAttempt,
    LearnerStats,
    LessonAttempt,
    Skill,
    Unit,
    User,
    UserAchievement,
    UserSkillProgress,
)
from app.models.progress import SkillStatus
from seed.seed import seed_cohort_learners


class DevService:
    @classmethod
    def reset_progress(cls, db: Session) -> Dict[str, Any]:
        """
        Resets learner progress and economy state back to a genuinely fresh learner baseline.
        - XP: 0, Streak: 0, Hearts: 5/5, Sparks: 0, Freezes: 0
        - Attempts: 0, Activities: 0, User Achievements: 0
        - Skills: First Words unlocked (0/2 lessons), all other 8 skills locked.
        Development-only: strictly blocked if ENABLE_DEV_RESET is false or environment is not development.
        Atomic and transactional.
        """
        if not settings.ENABLE_DEV_RESET or settings.ENVIRONMENT != "development":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Development reset is disabled in this environment.",
            )

        email = "ankush@lingoloop.local"
        now_utc = datetime.now(timezone.utc)
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                name="Ankush",
                email=email,
                avatar_key="milo_default",
                created_at=now_utc,
            )
            db.add(user)
            db.flush()

        # 1. Clean all learner attempts, activities, and achievements (atomic)
        attempt_ids = [
            att.id
            for att in db.query(LessonAttempt).filter(LessonAttempt.user_id == user.id).all()
        ]
        if attempt_ids:
            db.query(ExerciseAttempt).filter(
                ExerciseAttempt.lesson_attempt_id.in_(attempt_ids)
            ).delete(synchronize_session=False)

        db.query(LessonAttempt).filter(LessonAttempt.user_id == user.id).delete(
            synchronize_session=False
        )
        db.query(UserAchievement).filter(UserAchievement.user_id == user.id).delete(
            synchronize_session=False
        )
        db.query(DailyActivity).filter(DailyActivity.user_id == user.id).delete(
            synchronize_session=False
        )
        db.query(UserSkillProgress).filter(UserSkillProgress.user_id == user.id).delete(
            synchronize_session=False
        )

        db.flush()

        # 2. Reset LearnerStats to fresh baseline (0 XP, 5/5 Hearts, 0 Streak, 0 Sparks, 0 Freezes)
        stats = db.query(LearnerStats).filter(LearnerStats.user_id == user.id).first()
        if not stats:
            stats = LearnerStats(
                user_id=user.id,
                total_xp=0,
                current_streak=0,
                longest_streak=0,
                hearts=5,
                max_hearts=5,
                gems=0,
                streak_freeze_count=0,
                daily_goal_xp=30,
                last_activity_at=None,
                hearts_updated_at=now_utc,
            )
            db.add(stats)
        else:
            stats.total_xp = 0
            stats.current_streak = 0
            stats.longest_streak = 0
            stats.hearts = 5
            stats.max_hearts = 5
            stats.gems = 0
            stats.streak_freeze_count = 0
            stats.daily_goal_xp = 30
            stats.last_activity_at = None
            stats.hearts_updated_at = now_utc

        # 3. Retrieve active course and set fresh skill progress
        course = db.query(Course).filter(Course.is_active == True).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Active curriculum course missing in database.",
            )

        all_skills = (
            db.query(Skill)
            .join(Unit)
            .filter(Unit.course_id == course.id)
            .order_by(Unit.order_index, Skill.order_index)
            .all()
        )

        for idx, sk in enumerate(all_skills):
            # First skill (First Words) is unlocked; all other skills are locked
            if idx == 0:
                p_status = SkillStatus.UNLOCKED.value
                p_unlocked = True
            else:
                p_status = SkillStatus.LOCKED.value
                p_unlocked = False

            progress = UserSkillProgress(
                user_id=user.id,
                skill_id=sk.id,
                status=p_status,
                is_unlocked=p_unlocked,
                completed=False,
                crown_level=0,
                xp_earned=0,
                lessons_completed=0,
                last_practiced_at=None,
            )
            db.add(progress)

        # 4. Refresh cohort learners for leaderboard baseline
        seed_cohort_learners(db)

        db.commit()

        return {
            "success": True,
            "message": "Learner progress successfully reset to fresh, unstarted baseline.",
            "learner": {
                "name": user.name,
                "email": user.email,
                "total_xp": 0,
                "hearts": 5,
                "max_hearts": 5,
                "gems": 0,
                "streak": 0,
                "streak_freezes": 0,
                "skills_unlocked": 1,
            },
        }
