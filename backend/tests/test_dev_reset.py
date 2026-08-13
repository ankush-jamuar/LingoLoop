from fastapi import HTTPException
from app.config import settings
from app.database import SessionLocal
from app.models import (
    Achievement,
    Course,
    DailyActivity,
    Exercise,
    LearnerStats,
    Lesson,
    LessonAttempt,
    Skill,
    Unit,
    User,
    UserAchievement,
    UserSkillProgress,
)
from app.schemas.lesson_session import SubmitAnswerRequest
from app.services.dev_service import DevService
from app.services.gamification_service import GamificationService
from app.services.lesson_service import LessonService
from seed.seed import run_seed


def test_dev_reset_full_suite():
    print("=" * 70)
    print("LINGOLOOP: DEVELOPMENT RESET TEST SUITE")
    print("=" * 70)

    # 1. Start with pristine seed
    run_seed()
    db = SessionLocal()

    try:
        user = LessonService.get_user_by_email_or_default(db)
        stats = user.stats
        assert stats is not None

        # Verify initial baseline values
        assert stats.total_xp == 120
        assert stats.hearts == 4
        assert stats.gems == 80
        assert stats.current_streak == 3
        assert stats.streak_freeze_count == 0

        print("\n--- Initial Baseline Verified ---")
        print(f"XP: {stats.total_xp}, Hearts: {stats.hearts}/5, Sparks: {stats.gems}, Streak: {stats.current_streak}")

        # -------------------------------------------------------------
        # STEP 1: Mutate State via Lesson Session & Shop Purchases
        # -------------------------------------------------------------
        print("\n--- Mutating Learner State (Lessons + Sparks Shop) ---")
        # A. Buy Heart Refill (80 Sparks -> 30 Sparks, 4 Hearts -> 5 Hearts)
        refill_res = GamificationService.refill_hearts(db, user_id=user.id)
        db.refresh(stats)
        assert stats.gems == 30
        assert stats.hearts == 5
        print(f"1. Bought Heart Refill -> Sparks: {stats.gems}, Hearts: {stats.hearts}")

        # B. Start & Complete Meet & Greet Lesson 2 (Lesson 4)
        lesson_4 = db.get(Lesson, 4)
        assert lesson_4 is not None
        session = LessonService.start_lesson(db, lesson_id=lesson_4.id, user_id=user.id)
        for ex in session.exercises:
            LessonService.submit_exercise_answer(
                db,
                attempt_id=session.attempt_id,
                request=SubmitAnswerRequest(
                    exercise_id=ex.id,
                    selected_option_id="a",
                    typed_answer="Hola",
                ),
                user_id=user.id,
            )
        comp_res = LessonService.complete_lesson(
            db, attempt_id=session.attempt_id, user_id=user.id
        )
        db.refresh(stats)

        # Total XP increased, attempts increased, skills progressed
        print(f"2. Completed Lesson 4 -> XP: {stats.total_xp}, Streak: {stats.current_streak}")
        assert stats.total_xp > 120

        # Check total attempts count has increased
        attempts_count_mutated = (
            db.query(LessonAttempt).filter(LessonAttempt.user_id == user.id).count()
        )
        print(f"3. Mutated Attempts Count: {attempts_count_mutated} (Initial was 3)")
        assert attempts_count_mutated > 3

        # -------------------------------------------------------------
        # STEP 2: Execute Development Reset
        # -------------------------------------------------------------
        print("\n--- Executing DevService.reset_progress ---")
        reset_res = DevService.reset_progress(db)
        assert reset_res["success"] is True
        db.refresh(stats)

        # -------------------------------------------------------------
        # STEP 3: Verify Exact Baseline Restoration
        # -------------------------------------------------------------
        print("\n--- Verifying Restored State ---")
        print(f"Restored XP            : {stats.total_xp} (Expected: 120)")
        print(f"Restored Hearts        : {stats.hearts} (Expected: 4)")
        print(f"Restored Max Hearts    : {stats.max_hearts} (Expected: 5)")
        print(f"Restored Sparks        : {stats.gems} (Expected: 80)")
        print(f"Restored Streak        : {stats.current_streak} (Expected: 3)")
        print(f"Restored Freezes       : {stats.streak_freeze_count} (Expected: 0)")

        assert stats.total_xp == 120
        assert stats.hearts == 4
        assert stats.max_hearts == 5
        assert stats.gems == 80
        assert stats.current_streak == 3
        assert stats.streak_freeze_count == 0

        # Verify Lesson Attempts restored to exact 3 seeded attempts
        attempts_restored = (
            db.query(LessonAttempt).filter(LessonAttempt.user_id == user.id).count()
        )
        print(f"Restored Attempts Count: {attempts_restored} (Expected: 3)")
        assert attempts_restored == 3

        # Verify User Skill Progress
        skills_prog = (
            db.query(UserSkillProgress)
            .filter(UserSkillProgress.user_id == user.id)
            .all()
        )
        assert len(skills_prog) == 9
        # First Words (skill 1)
        fw = [p for p in skills_prog if p.skill_id == 1][0]
        assert fw.status == "completed"
        assert fw.completed is True
        assert fw.lessons_completed == 2
        # Meet & Greet (skill 2)
        mg = [p for p in skills_prog if p.skill_id == 2][0]
        assert mg.status == "in_progress"
        assert mg.completed is False
        assert mg.lessons_completed == 1
        # Tiny Conversations (skill 3)
        tc = [p for p in skills_prog if p.skill_id == 3][0]
        assert tc.status == "unlocked"
        assert tc.completed is False
        assert tc.lessons_completed == 0

        print("Verified: UserSkillProgress accurately restored to baseline.")

        # Verify User Achievements (only 2 baseline achievements)
        user_ach_count = (
            db.query(UserAchievement)
            .filter(UserAchievement.user_id == user.id)
            .count()
        )
        print(f"Restored Achievements  : {user_ach_count} (Expected: 2)")
        assert user_ach_count == 2

        # Verify Static Seed Data Preserved
        assert db.query(Course).count() == 1
        assert db.query(Unit).count() == 3
        assert db.query(Skill).count() == 9
        assert db.query(Lesson).count() == 18
        assert db.query(Exercise).count() == 90
        assert db.query(Achievement).count() == 6
        assert db.query(User).count() == 10  # Ankush + 9 cohort peers

        print("Verified: Static curriculum and achievement catalog fully preserved.")

        # -------------------------------------------------------------
        # STEP 4: Guard Test - Rejection when ENABLE_DEV_RESET is False
        # -------------------------------------------------------------
        print("\n--- Testing Guard when ENABLE_DEV_RESET=False ---")
        settings.ENABLE_DEV_RESET = False
        try:
            DevService.reset_progress(db)
            assert False, "Should raise 403 when dev reset is disabled"
        except HTTPException as exc:
            assert exc.status_code == 403
            assert "Development reset is disabled" in exc.detail
            print(f"Verified: Reset correctly rejected with HTTP 403 ({exc.detail})")
        finally:
            settings.ENABLE_DEV_RESET = True

        print("\n" + "=" * 70)
        print("ALL DEV RESET TESTS PASSED WITH 100% SUCCESS!")
        print("=" * 70)

    finally:
        db.close()


if __name__ == "__main__":
    test_dev_reset_full_suite()
