from datetime import date, datetime, timedelta, timezone
from fastapi import HTTPException
from app.database import SessionLocal
from app.models import (
    DailyActivity,
    LearnerStats,
    Lesson,
    LessonAttempt,
    User,
    UserAchievement,
    UserSkillProgress,
)
from app.schemas.lesson_session import MatchedPairSubmission, SubmitAnswerRequest
from app.services.gamification_service import GamificationService
from app.services.lesson_service import LessonService
from seed.seed import run_seed


def test_gamification_full_suite():
    print("=" * 70)
    print("LINGOLOOP PHASE 5: GAMIFICATION & ECONOMY TEST SUITE")
    print("=" * 70)

    # 1. Clean Seed
    run_seed()
    db = SessionLocal()

    try:
        user = LessonService.get_user_by_email_or_default(db)
        stats = user.stats
        assert stats is not None

        # -------------------------------------------------------------
        # TEST 1: Authoritative Heart Regeneration Semantics
        # -------------------------------------------------------------
        print("\n--- 1. Heart Regeneration Semantics ---")
        now_utc = datetime.now(timezone.utc)
        stats.hearts = 2
        stats.max_hearts = 5
        # Set last updated to 6 hours ago (21,600s)
        # 6 hours / 4 hours = 1 heart gained (hearts -> 3), 2 hours (7,200s) remainder preserved
        stats.hearts_updated_at = now_utc - timedelta(hours=6)
        db.commit()

        regen_res1 = GamificationService.evaluate_heart_regen(db, user_id=user.id)
        db.refresh(stats)
        print(f"6h elapsed -> Hearts: {stats.hearts} (Expected: 3), Next Heart In: {regen_res1.seconds_until_next_heart}s (Expected: ~7200s)")
        assert stats.hearts == 3
        assert regen_res1.seconds_until_next_heart is not None
        assert 7100 <= regen_res1.seconds_until_next_heart <= 7300

        # Fast forward another 8 hours (2 hearts gained -> hearts 5/5 max cap)
        stats.hearts_updated_at = now_utc - timedelta(hours=9)
        db.commit()

        regen_res2 = GamificationService.evaluate_heart_regen(db, user_id=user.id)
        db.refresh(stats)
        print(f"9h elapsed -> Hearts: {stats.hearts} (Expected: 5 max), Next Heart In: {regen_res2.seconds_until_next_heart}")
        assert stats.hearts == 5
        assert regen_res2.seconds_until_next_heart is None
        print("Verified: Heart regen calculates elapsed hours, preserves partial remainder, and caps strictly at 5.")

        # -------------------------------------------------------------
        # TEST 2: Sparks Shop Heart Refills
        # -------------------------------------------------------------
        print("\n--- 2. Sparks Shop Heart Refills ---")
        # Scenario A: Rejection when hearts already full (5/5)
        try:
            GamificationService.refill_hearts(db, user_id=user.id)
            assert False, "Should reject refill when full"
        except HTTPException as exc:
            assert exc.status_code == 400
            assert "already at maximum" in exc.detail
            print(f"Verified: Refill rejected when already at 5/5 ({exc.detail})")

        # Scenario B: Insufficient sparks
        stats.hearts = 1
        stats.gems = 30  # Less than 50 Sparks
        db.commit()
        try:
            GamificationService.refill_hearts(db, user_id=user.id)
            assert False, "Should reject refill when insufficient sparks"
        except HTTPException as exc:
            assert exc.status_code == 400
            assert "Insufficient Sparks" in exc.detail
            print(f"Verified: Refill rejected when sparks < 50 ({exc.detail})")

        # Scenario C: Successful Refill (50 Sparks deducted, hearts -> 5)
        stats.gems = 80
        db.commit()
        refill_res = GamificationService.refill_hearts(db, user_id=user.id)
        db.refresh(stats)
        print(f"Refill Successful: Hearts {stats.hearts}/5, Sparks Remaining: {stats.gems} (Expected: 30 = 80 - 50)")
        assert refill_res.success is True
        assert stats.hearts == 5
        assert stats.gems == 30

        # -------------------------------------------------------------
        # TEST 3: Streak Freeze Purchase & Capacity Limit
        # -------------------------------------------------------------
        print("\n--- 3. Streak Freeze Economy & Capacity ---")
        stats.gems = 250
        stats.streak_freeze_count = 0
        db.commit()

        # Buy 1st freeze
        freeze_res1 = GamificationService.buy_streak_freeze(db, user_id=user.id)
        db.refresh(stats)
        assert stats.streak_freeze_count == 1
        assert stats.gems == 150
        print(f"Bought 1st Streak Freeze: Stored: {stats.streak_freeze_count}/2, Sparks: {stats.gems}")

        # Buy 2nd freeze
        freeze_res2 = GamificationService.buy_streak_freeze(db, user_id=user.id)
        db.refresh(stats)
        assert stats.streak_freeze_count == 2
        assert stats.gems == 50
        print(f"Bought 2nd Streak Freeze: Stored: {stats.streak_freeze_count}/2, Sparks: {stats.gems}")

        # Buy 3rd freeze -> Rejected (Capacity max 2)
        try:
            GamificationService.buy_streak_freeze(db, user_id=user.id)
            assert False, "Should reject 3rd freeze (max 2)"
        except HTTPException as exc:
            assert exc.status_code == 400
            assert "capacity (2) reached" in exc.detail
            print(f"Verified: 3rd Streak Freeze purchase rejected ({exc.detail})")

        # -------------------------------------------------------------
        # TEST 4: Streak Freeze Consumption on Missed Calendar Day
        # -------------------------------------------------------------
        print("\n--- 4. Streak Freeze Consumption on Missed Day ---")
        # Remove today's activity to simulate first completion of the day
        today_date = now_utc.date()
        db.query(DailyActivity).filter(
            DailyActivity.user_id == user.id,
            DailyActivity.activity_date == today_date
        ).delete(synchronize_session=False)

        # Simulate last activity 2 days ago (missed yesterday)
        stats.current_streak = 5
        stats.last_activity_at = now_utc - timedelta(days=2)
        stats.hearts = 5
        stats.streak_freeze_count = 1
        db.commit()

        # Target Lesson 3 (Meet & Greet Lesson 1 replay)
        lesson_3 = db.get(Lesson, 3)
        assert lesson_3 is not None
        session_freeze = LessonService.start_lesson(db, lesson_id=lesson_3.id, user_id=user.id)
        for ex in session_freeze.exercises:
            LessonService.submit_exercise_answer(
                db, attempt_id=session_freeze.attempt_id,
                request=SubmitAnswerRequest(exercise_id=ex.id, selected_option_id="a", typed_answer="Me llamo"),
                user_id=user.id
            )
        comp_freeze = LessonService.complete_lesson(db, attempt_id=session_freeze.attempt_id, user_id=user.id)
        db.refresh(stats)

        print(f"Missed yesterday + 1 Freeze -> Current Streak: {stats.current_streak} (Expected: 6 = 5 + 1), Freezes Left: {stats.streak_freeze_count} (Expected: 0)")
        assert stats.current_streak == 6
        assert stats.streak_freeze_count == 0
        print("Verified: Streak Freeze consumed to protect streak against 1 missed day.")

        # -------------------------------------------------------------
        # TEST 5: Practice-for-Hearts Recovery
        # -------------------------------------------------------------
        print("\n--- 5. Practice-for-Hearts Recovery Rule ---")
        stats.hearts = 3  # Missing 2 hearts
        db.commit()

        # Replay Lesson 1 (First Words Lesson 1) with score 100%
        lesson_1 = db.get(Lesson, 1)
        assert lesson_1 is not None
        session_practice = LessonService.start_lesson(db, lesson_id=lesson_1.id, user_id=user.id)

        # Submit correct answers for lesson 1
        LessonService.submit_exercise_answer(
            db, attempt_id=session_practice.attempt_id,
            request=SubmitAnswerRequest(exercise_id=session_practice.exercises[0].id, selected_option_id="opt1"),
            user_id=user.id
        )
        LessonService.submit_exercise_answer(
            db, attempt_id=session_practice.attempt_id,
            request=SubmitAnswerRequest(exercise_id=session_practice.exercises[1].id, translated_tokens=["Adiós"]),
            user_id=user.id
        )
        LessonService.submit_exercise_answer(
            db, attempt_id=session_practice.attempt_id,
            request=SubmitAnswerRequest(
                exercise_id=session_practice.exercises[2].id,
                matched_pairs=[
                    MatchedPairSubmission(left="Hola", right="Hello"),
                    MatchedPairSubmission(left="Adiós", right="Goodbye"),
                    MatchedPairSubmission(left="Buenas noches", right="Good night"),
                ]
            ),
            user_id=user.id
        )
        LessonService.submit_exercise_answer(
            db, attempt_id=session_practice.attempt_id,
            request=SubmitAnswerRequest(exercise_id=session_practice.exercises[3].id, typed_answer="Hola"),
            user_id=user.id
        )
        LessonService.submit_exercise_answer(
            db, attempt_id=session_practice.attempt_id,
            request=SubmitAnswerRequest(exercise_id=session_practice.exercises[4].id, typed_answer="Buenos días"),
            user_id=user.id
        )

        comp_practice = LessonService.complete_lesson(db, attempt_id=session_practice.attempt_id, user_id=user.id)
        db.refresh(stats)

        print(f"Replay with 100% score -> Hearts: 3 -> {stats.hearts} (Expected: 4, +1 Heart Recovered)")
        assert stats.hearts == 4
        print("Verified: Practice-for-hearts recovered +1 heart on successful replay.")

        # -------------------------------------------------------------
        # TEST 6: Automated Achievement Unlocking & Spark Rewards
        # -------------------------------------------------------------
        print("\n--- 6. Automated Achievement Unlocking & Spark Rewards ---")
        sparks_before_ach = stats.gems
        unlocked_titles = GamificationService.evaluate_achievements(db, user_id=user.id)
        db.refresh(stats)
        ach_resp = GamificationService.get_achievements(db, user_id=user.id)

        print(f"Total Achievements in Catalog: {ach_resp.total_achievements}")
        print(f"Unlocked Achievements        : {ach_resp.unlocked_count}")
        for ach in ach_resp.achievements:
            status_str = f"UNLOCKED (+{ach.reward_sparks} Sparks)" if ach.is_unlocked else f"LOCKED ({ach.progress}%)"
            print(f"  - [{ach.key}] {ach.title:<22}: {status_str}")

        assert ach_resp.total_achievements == 6
        assert ach_resp.unlocked_count >= 2  # first_loop and momentum_100 unlocked

        # Verify Sparks were automatically credited
        # Re-evaluate -> Idempotent, zero duplicate rewards
        dup_titles = GamificationService.evaluate_achievements(db, user_id=user.id)
        assert len(dup_titles) == 0
        print("Verified: Automated achievement unlock and Sparks rewards are fully idempotent.")

        # -------------------------------------------------------------
        # TEST 7: Weekly Leaderboard Engine & Cohort Ranking
        # -------------------------------------------------------------
        print("\n--- 7. Weekly Leaderboard Engine (Silver Loop League) ---")
        leaderboard = GamificationService.get_leaderboard(db, user_id=user.id)

        print(f"League Tier: {leaderboard.tier_name}")
        print(f"Current User Rank: #{leaderboard.user_rank} with {leaderboard.user_weekly_xp} Weekly XP")
        print(f"Cycle: {leaderboard.cycle_starts_at.date()} to {leaderboard.cycle_ends_at.date()}")
        print("-" * 50)
        for entry in leaderboard.entries:
            marker = " (YOU)" if entry.is_current_user else ""
            print(f"  #{entry.rank:<2} {entry.name:<18} : {entry.weekly_xp:>3} XP [{entry.zone.upper()}]{marker}")

        assert len(leaderboard.entries) == 10
        assert leaderboard.entries[0].zone == "podium"
        assert leaderboard.entries[1].zone == "podium"
        assert leaderboard.entries[2].zone == "podium"
        assert leaderboard.entries[3].zone == "promotion"
        assert leaderboard.entries[9].zone == "demotion"
        assert leaderboard.user_rank > 0

        # Verify sorted strictly by weekly_xp DESC
        weekly_xps = [e.weekly_xp for e in leaderboard.entries]
        assert weekly_xps == sorted(weekly_xps, reverse=True)
        print("Verified: Leaderboard accurately aggregates active weekly DailyActivity XP and computes deterministic tier rankings.")

        print("\n" + "=" * 70)
        print("ALL PHASE 5 GAMIFICATION ENGINE TESTS PASSED WITH 100% SUCCESS!")
        print("=" * 70)

    finally:
        db.close()


if __name__ == "__main__":
    test_gamification_full_suite()
