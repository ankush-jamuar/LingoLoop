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
    User,
    UserAchievement,
    UserSkillProgress,
)
from seed.seed import seed_achievements, seed_cohort_learners, seed_learner


class DevService:
    @classmethod
    def reset_progress(cls, db: Session) -> Dict[str, Any]:
        """
        Resets learner progress and economy state back to the exact seeded baseline.
        Development-only: strictly blocked if ENABLE_DEV_RESET is false or environment is not development.
        Atomic and transactional.
        """
        if not settings.ENABLE_DEV_RESET or settings.ENVIRONMENT != "development":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Development reset is disabled in this environment.",
            )

        email = "ankush@lingoloop.local"
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Learner not found.",
            )

        # 1. Clean learner attempts and progress (atomic)
        # Find attempt IDs to clean exercise attempts
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

        # 2. Retrieve active course and achievement catalog
        course = db.query(Course).filter(Course.is_active == True).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Active curriculum course missing in database.",
            )

        achievement_map = seed_achievements(db)

        # 3. Restore exact baseline using single source of truth
        seed_learner(db, course, achievement_map)
        seed_cohort_learners(db)

        db.commit()

        # 4. Refresh stats for summary
        stats = db.query(LearnerStats).filter(LearnerStats.user_id == user.id).first()
        user_skills = (
            db.query(UserSkillProgress).filter(UserSkillProgress.user_id == user.id).all()
        )
        unlocked_skills = [s for s in user_skills if s.is_unlocked]

        return {
            "success": True,
            "message": "Learner progress successfully reset to pristine seeded baseline.",
            "learner": {
                "name": user.name,
                "email": user.email,
                "total_xp": stats.total_xp if stats else 120,
                "hearts": stats.hearts if stats else 4,
                "max_hearts": stats.max_hearts if stats else 5,
                "gems": stats.gems if stats else 80,
                "streak": stats.current_streak if stats else 3,
                "streak_freezes": stats.streak_freeze_count if stats else 0,
                "skills_unlocked": len(unlocked_skills),
            },
        }
