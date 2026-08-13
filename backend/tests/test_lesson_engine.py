from app.database import SessionLocal
from app.models import Course, Lesson, LessonAttempt, ExerciseAttempt, User, LearnerStats, UserSkillProgress, DailyActivity
from app.services.lesson_service import LessonService
from app.schemas.lesson_session import SubmitAnswerRequest, MatchedPairSubmission


def test_lesson_engine_full_lifecycle():
    db = SessionLocal()
    try:
        user = LessonService.get_user_by_email_or_default(db)
        print(f"Testing with user: {user.name} ({user.email}), Initial Total XP: {user.stats.total_xp}, Hearts: {user.stats.hearts}")

        # Ensure learner has hearts and clean up previous test runs for Lesson 4
        user.stats.hearts = 5
        db.query(ExerciseAttempt).filter(ExerciseAttempt.lesson_attempt_id.in_(
            db.query(LessonAttempt.id).filter(LessonAttempt.lesson_id == 4)
        )).delete(synchronize_session=False)
        db.query(LessonAttempt).filter(LessonAttempt.lesson_id == 4).delete(synchronize_session=False)
        # Reset UserSkillProgress for skill 2 to lessons_completed = 1, completed = False
        usp2 = db.query(UserSkillProgress).filter(UserSkillProgress.user_id == user.id, UserSkillProgress.skill_id == 2).first()
        if usp2:
            usp2.lessons_completed = 1
            usp2.completed = False
            usp2.status = "in_progress"
        db.commit()

        # Target Lesson 4 (Meet & Greet -> Lesson 2: How Are You?)
        lesson_4 = db.get(Lesson, 4)
        assert lesson_4 is not None
        print(f"Target Lesson: {lesson_4.title} (ID: {lesson_4.id}, XP Reward: {lesson_4.xp_reward})")

        # 1. Start Lesson
        session = LessonService.start_lesson(db, lesson_id=lesson_4.id, user_id=user.id)
        assert session.attempt_id > 0
        assert session.lesson_id == lesson_4.id
        assert len(session.exercises) == 5
        print(f"1. Started Session: Attempt ID {session.attempt_id}, Loaded {len(session.exercises)} exercises")

        # Verify Sanitization: No secrets leaked
        for ex in session.exercises:
            assert not hasattr(ex, "correctOptionId")
            assert not hasattr(ex, "acceptedAnswers")
            if ex.type == "multiple_choice":
                for opt in ex.options:
                    assert hasattr(opt, "id")
                    assert hasattr(opt, "text")
                    assert not hasattr(opt, "is_correct")
        print("2. Verified Sanitization: Zero secret answers in client payload")

        # 2. Verify Multiple Active Attempt Prevention
        resumed_session = LessonService.start_lesson(db, lesson_id=lesson_4.id, user_id=user.id)
        assert resumed_session.attempt_id == session.attempt_id
        assert resumed_session.is_resumed is True
        print("3. Verified Multiple Active Attempt Prevention: Re-used existing attempt")

        # 3. Test Premature Completion Rejection
        try:
            LessonService.complete_lesson(db, attempt_id=session.attempt_id, user_id=user.id)
            assert False, "Should have rejected premature completion"
        except Exception as exc:
            assert "exercises have not yet been submitted" in str(exc.detail)
            print("4. Verified Premature Completion Rejection: Rejected unsubmitted session")

        # 4. Submit Answers for all 5 Exercises
        # Exercise 1 (16): multiple_choice -> "How do you ask 'How are you?' informally?" -> "a"
        ex1 = session.exercises[0]
        res1 = LessonService.submit_exercise_answer(
            db, attempt_id=session.attempt_id,
            request=SubmitAnswerRequest(exercise_id=ex1.id, selected_option_id="a"),
            user_id=user.id
        )
        assert res1.is_correct is True
        assert res1.hearts_remaining == 5

        # Exercise 2 (17): translate -> "Very well, thank you" -> ["Muy", "bien,", "gracias"]
        ex2 = session.exercises[1]
        res2 = LessonService.submit_exercise_answer(
            db, attempt_id=session.attempt_id,
            request=SubmitAnswerRequest(exercise_id=ex2.id, translated_tokens=["Muy", "bien,", "gracias"]),
            user_id=user.id
        )
        assert res2.is_correct is True

        # Exercise 3 (18): match_pairs -> Bien/Good, Muy bien/Very good, Así así/So-so
        ex3 = session.exercises[2]
        res3 = LessonService.submit_exercise_answer(
            db, attempt_id=session.attempt_id,
            request=SubmitAnswerRequest(
                exercise_id=ex3.id,
                matched_pairs=[
                    MatchedPairSubmission(left="Bien", right="Good"),
                    MatchedPairSubmission(left="Muy bien", right="Very good"),
                    MatchedPairSubmission(left="Así así", right="So-so"),
                ]
            ),
            user_id=user.id
        )
        assert res3.is_correct is True

        # Exercise 4 (19): fill_blank -> '¿___ tal?' -> 'Qué' / 'que'
        ex4 = session.exercises[3]
        res4 = LessonService.submit_exercise_answer(
            db, attempt_id=session.attempt_id,
            request=SubmitAnswerRequest(exercise_id=ex4.id, typed_answer="Qué"),
            user_id=user.id
        )
        assert res4.is_correct is True

        # Exercise 5 (20): type_answer -> 'I am fine' -> 'Estoy bien'
        ex5 = session.exercises[4]
        res5 = LessonService.submit_exercise_answer(
            db, attempt_id=session.attempt_id,
            request=SubmitAnswerRequest(exercise_id=ex5.id, typed_answer="Estoy bien"),
            user_id=user.id
        )
        assert res5.is_correct is True
        print("5. Verified All 5 Exercise Submissions & Backend Authoritative Validations")

        # 5. Complete Lesson Session
        initial_xp = user.stats.total_xp
        comp_res = LessonService.complete_lesson(db, attempt_id=session.attempt_id, user_id=user.id)
        assert comp_res.status == "completed"
        expected_xp = lesson_4.xp_reward + (5 if comp_res.hearts_remaining == 5 else 0)
        assert comp_res.total_xp_awarded == expected_xp
        assert comp_res.skill_completed is True
        assert comp_res.unlocked_skill_title == "Tiny Conversations"
        print(f"6. Lesson Completed Successfully! XP Awarded: {comp_res.total_xp_awarded}, Unlocked: {comp_res.unlocked_skill_title}")

        # Verify DB Updates
        db.refresh(user.stats)
        assert user.stats.total_xp == initial_xp + expected_xp

        # 6. Test Duplicate Completion Rejection
        try:
            LessonService.complete_lesson(db, attempt_id=session.attempt_id, user_id=user.id)
            assert False, "Should have rejected duplicate completion"
        except Exception as exc:
            assert "already 'completed'" in str(exc.detail)
            print("7. Verified Completion Idempotency: Rejected duplicate completion call")

        # 7. Test Replay XP Rule
        replay_session = LessonService.start_lesson(db, lesson_id=lesson_4.id, user_id=user.id)
        for ex in replay_session.exercises:
            LessonService.submit_exercise_answer(
                db, attempt_id=replay_session.attempt_id,
                request=SubmitAnswerRequest(exercise_id=ex.id, selected_option_id="a", typed_answer="bien"),
                user_id=user.id
            )
        replay_comp = LessonService.complete_lesson(db, attempt_id=replay_session.attempt_id, user_id=user.id)
        assert replay_comp.is_replay is True
        assert replay_comp.total_xp_awarded == 5  # 5 practice XP for replay
        print("8. Verified Replay Rule: Awarded exactly 5 practice XP without duplicating skill progression")

        print("=" * 60)
        print("ALL BACKEND LESSON ENGINE TESTS PASSED PERFECTLY!")
        print("=" * 60)
    finally:
        db.close()


if __name__ == "__main__":
    test_lesson_engine_full_lifecycle()
