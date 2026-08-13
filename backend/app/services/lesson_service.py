import random
import re
import unicodedata
from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models import (
    Course,
    DailyActivity,
    Exercise,
    ExerciseAttempt,
    LearnerStats,
    Lesson,
    LessonAttempt,
    Skill,
    SkillStatus,
    Unit,
    User,
    UserSkillProgress,
)
from app.schemas.lesson_session import (
    ExerciseValidationResponse,
    LessonAbandonResponse,
    LessonCompletionResponse,
    LessonSessionResponse,
    SanitizedExercise,
    SanitizedExerciseOption,
    SubmitAnswerRequest,
)


def normalize_text(text: Optional[str]) -> str:
    """Normalizes string for forgiving accent, whitespace, and punctuation comparison."""
    if not text:
        return ""
    # Strip leading/trailing whitespaces and lowercase
    cleaned = text.strip().lower()
    # Normalize unicode (decompose accents e.g., 'á' -> 'a' + combining acute)
    nfkd = unicodedata.normalize("NFKD", cleaned)
    without_accents = "".join([c for c in nfkd if not unicodedata.combining(c)])
    # Remove common punctuation: . , ! ? ¿ ¡ ; : " ' -
    without_punct = re.sub(r"[.,!?:;¿¡\"'\-]", "", without_accents)
    # Collapse multiple spaces
    return re.sub(r"\s+", " ", without_punct).strip()


class LessonService:
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
            # Fallback to the first user
            stmt_fallback = select(User).options(joinedload(User.stats)).limit(1)
            user = db.scalars(stmt_fallback).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Learner user not found. Please seed the database.",
            )
        return user

    @classmethod
    def start_lesson(
        cls, db: Session, lesson_id: int, user_id: int
    ) -> LessonSessionResponse:
        """
        Starts or resumes a lesson session.
        Safeguards:
        1. Prevents duplicate active attempts (resumes existing in_progress attempt if one exists).
        2. Sanitizes exercise payloads to ensure zero secret answers are leaked to the client.
        """
        # 1. Fetch lesson with course hierarchy & ordered exercises
        stmt = (
            select(Lesson)
            .options(
                joinedload(Lesson.skill)
                .joinedload(Skill.unit)
                .joinedload(Unit.course),
                joinedload(Lesson.exercises),
            )
            .where(Lesson.id == lesson_id)
        )
        lesson = db.scalars(stmt).unique().first()
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lesson with ID {lesson_id} not found.",
            )

        # 2. Query learner stats
        stats_stmt = select(LearnerStats).where(LearnerStats.user_id == user_id)
        learner_stats = db.scalars(stats_stmt).first()
        if not learner_stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Learner stats not found.",
            )

        # Check if learner has hearts to start
        if learner_stats.hearts <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot start lesson: you are out of hearts. Practice or refill hearts to continue.",
            )

        # 3. Check for existing in_progress attempt (Safeguard 6)
        active_stmt = (
            select(LessonAttempt)
            .where(
                LessonAttempt.user_id == user_id,
                LessonAttempt.lesson_id == lesson_id,
                LessonAttempt.status == "in_progress",
            )
            .order_by(LessonAttempt.started_at.desc())
        )
        existing_attempt = db.scalars(active_stmt).first()

        is_resumed = False
        if existing_attempt:
            attempt = existing_attempt
            is_resumed = True
        else:
            now_utc = datetime.now(timezone.utc)
            attempt = LessonAttempt(
                user_id=user_id,
                lesson_id=lesson_id,
                status="in_progress",
                score=0,
                xp_earned=0,
                hearts_lost=0,
                started_at=now_utc,
                completed_at=None,
            )
            db.add(attempt)
            db.commit()
            db.refresh(attempt)

        # 4. Construct sanitized exercises (Safeguard 8: NO SECRET LEAKS)
        sanitized_exercises: list[SanitizedExercise] = []
        for ex in sorted(lesson.exercises, key=lambda e: e.order_index):
            content = ex.content or {}
            ex_type = ex.type

            options: Optional[list[SanitizedExerciseOption]] = None
            source_text: Optional[str] = None
            word_bank: Optional[list[str]] = None
            pair_left_tokens: Optional[list[str]] = None
            pair_right_tokens: Optional[list[str]] = None
            sentence_template: Optional[str] = None

            if ex_type == "multiple_choice":
                # Only expose id and text, NEVER correctOptionId
                raw_options = content.get("options", [])
                options = [
                    SanitizedExerciseOption(id=opt["id"], text=opt["text"])
                    for opt in raw_options
                ]
            elif ex_type == "translate":
                source_text = content.get("sourceText")
                # Expose word bank tokens without accepted answers
                raw_bank = list(content.get("wordBank", []))
                # Deterministically shuffle or preserve
                word_bank = raw_bank
            elif ex_type == "match_pairs":
                raw_pairs = content.get("pairs", [])
                # Provide shuffled tokens so index position does not leak matches
                left_tokens = [p["left"] for p in raw_pairs]
                right_tokens = [p["right"] for p in raw_pairs]
                # Shuffle right tokens with fixed seed based on exercise ID for client stability
                shuffled_right = list(right_tokens)
                random.Random(ex.id).shuffle(shuffled_right)
                pair_left_tokens = left_tokens
                pair_right_tokens = shuffled_right
            elif ex_type == "fill_blank":
                sentence_template = content.get("sentence")
            elif ex_type == "type_answer":
                pass  # prompt & instruction are sufficient

            sanitized_exercises.append(
                SanitizedExercise(
                    id=ex.id,
                    lesson_id=ex.lesson_id,
                    type=ex_type,
                    prompt=ex.prompt,
                    instruction=ex.instruction,
                    order_index=ex.order_index,
                    xp_reward=ex.xp_reward,
                    options=options,
                    source_text=source_text,
                    word_bank=word_bank,
                    pair_left_tokens=pair_left_tokens,
                    pair_right_tokens=pair_right_tokens,
                    sentence_template=sentence_template,
                )
            )

        course_id = lesson.skill.unit.course.id if (lesson.skill and lesson.skill.unit and lesson.skill.unit.course) else 1

        return LessonSessionResponse(
            attempt_id=attempt.id,
            lesson_id=lesson.id,
            lesson_title=lesson.title,
            skill_id=lesson.skill.id if lesson.skill else 0,
            skill_title=lesson.skill.title if lesson.skill else "",
            course_id=course_id,
            hearts_remaining=learner_stats.hearts,
            max_hearts=learner_stats.max_hearts,
            total_exercises=len(sanitized_exercises),
            is_resumed=is_resumed,
            exercises=sanitized_exercises,
        )

    @classmethod
    def submit_exercise_answer(
        cls, db: Session, attempt_id: int, request: SubmitAnswerRequest, user_id: int
    ) -> ExerciseValidationResponse:
        """
        Authoritative answer validation and atomic state updates.
        Safeguards:
        1. Validates answer against stored database content.
        2. Persists ExerciseAttempt with accurate attempt_number.
        3. Decrements LearnerStats.hearts on wrong submission; fails attempt if hearts reach 0.
        4. Transactionally committed.
        """
        # 1. Fetch attempt and verify ownership & status
        attempt = db.get(LessonAttempt, attempt_id)
        if not attempt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lesson attempt with ID {attempt_id} not found.",
            )
        if attempt.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to submit answers for this attempt.",
            )
        if attempt.status != "in_progress":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot submit answer: attempt status is '{attempt.status}'.",
            )

        # 2. Fetch exercise and verify it belongs to this lesson
        exercise = db.get(Exercise, request.exercise_id)
        if not exercise or exercise.lesson_id != attempt.lesson_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Exercise does not belong to this active lesson attempt.",
            )

        # 3. Query LearnerStats
        stats_stmt = select(LearnerStats).where(LearnerStats.user_id == user_id)
        learner_stats = db.scalars(stats_stmt).first()
        if not learner_stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Learner stats not found.",
            )

        # 4. Determine attempt number (Safeguard 7)
        prior_attempts_count = db.scalar(
            select(func.count(ExerciseAttempt.id)).where(
                ExerciseAttempt.lesson_attempt_id == attempt_id,
                ExerciseAttempt.exercise_id == exercise.id,
            )
        ) or 0
        attempt_number = prior_attempts_count + 1

        # 5. Authoritative Validation
        content = exercise.content or {}
        ex_type = exercise.type
        is_correct = False
        correct_answer_display: Optional[str] = None
        explanation: Optional[str] = None

        if ex_type == "multiple_choice":
            correct_opt_id = content.get("correctOptionId")
            is_correct = (request.selected_option_id == correct_opt_id)
            # Find display text for the correct option
            for opt in content.get("options", []):
                if opt.get("id") == correct_opt_id:
                    correct_answer_display = opt.get("text")
                    break

        elif ex_type == "translate":
            accepted = content.get("acceptedAnswers", [])
            submitted = " ".join(request.translated_tokens or []).strip()
            norm_submitted = normalize_text(submitted)
            norm_accepted = [normalize_text(ans) for ans in accepted]
            is_correct = norm_submitted in norm_accepted
            correct_answer_display = accepted[0] if accepted else None

        elif ex_type == "match_pairs":
            pairs = content.get("pairs", [])
            expected_map = {p["left"].strip(): p["right"].strip() for p in pairs}
            submitted_map = {
                p.left.strip(): p.right.strip() for p in (request.matched_pairs or [])
            }
            is_correct = (submitted_map == expected_map)
            correct_answer_display = ", ".join(f"{k} → {v}" for k, v in expected_map.items())

        elif ex_type == "fill_blank":
            accepted = content.get("acceptedAnswers", [])
            submitted = (request.typed_answer or "").strip()
            norm_submitted = normalize_text(submitted)
            norm_accepted = [normalize_text(ans) for ans in accepted]
            is_correct = norm_submitted in norm_accepted
            correct_answer_display = accepted[0] if accepted else None

        elif ex_type == "type_answer":
            accepted = content.get("acceptedAnswers", [])
            case_sensitive = content.get("caseSensitive", False)
            submitted = (request.typed_answer or "").strip()
            if case_sensitive:
                is_correct = submitted in accepted
            else:
                norm_submitted = normalize_text(submitted)
                norm_accepted = [normalize_text(ans) for ans in accepted]
                is_correct = norm_submitted in norm_accepted
            correct_answer_display = accepted[0] if accepted else None

        # 6. Apply Hearts & Exercise State Mutations (Safeguard 5 & 9)
        now_utc = datetime.now(timezone.utc)
        xp_earned_for_attempt = exercise.xp_reward if is_correct else 0

        if not is_correct:
            learner_stats.hearts = max(0, learner_stats.hearts - 1)
            attempt.hearts_lost += 1
            if learner_stats.hearts == 0:
                attempt.status = "failed"
                attempt.completed_at = now_utc

        # 7. Record ExerciseAttempt
        ex_attempt = ExerciseAttempt(
            lesson_attempt_id=attempt.id,
            exercise_id=exercise.id,
            answer=request.model_dump(exclude_none=True),
            is_correct=is_correct,
            attempt_number=attempt_number,
            xp_earned=xp_earned_for_attempt,
            created_at=now_utc,
        )
        db.add(ex_attempt)
        db.commit()
        db.refresh(learner_stats)
        db.refresh(attempt)

        return ExerciseValidationResponse(
            attempt_id=attempt.id,
            exercise_id=exercise.id,
            is_correct=is_correct,
            attempt_number=attempt_number,
            xp_earned=xp_earned_for_attempt,
            hearts_remaining=learner_stats.hearts,
            correct_answer_display=None if is_correct else correct_answer_display,
            explanation=explanation,
            is_lesson_failed=(learner_stats.hearts == 0),
        )

    @classmethod
    def complete_lesson(
        cls, db: Session, attempt_id: int, user_id: int
    ) -> LessonCompletionResponse:
        """
        Finalizes a lesson attempt and evaluates progression.
        Safeguards:
        1. Rejects completion if attempt is not in_progress.
        2. Rejects completion if any exercises are missing.
        3. Rejects completion if learner is out of hearts.
        4. Idempotent: XP, streak, and progression update exactly once.
        5. Replay rule: Replaying already completed lessons awards 5 practice XP only and does not inflate distinct lessons_completed.
        """
        now_utc = datetime.now(timezone.utc)

        # 1. Fetch attempt with full hierarchy
        stmt = (
            select(LessonAttempt)
            .options(
                joinedload(LessonAttempt.lesson)
                .joinedload(Lesson.skill)
                .joinedload(Skill.unit)
                .joinedload(Unit.course),
                joinedload(LessonAttempt.lesson).joinedload(Lesson.exercises),
            )
            .where(LessonAttempt.id == attempt_id)
        )
        attempt = db.scalars(stmt).unique().first()
        if not attempt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lesson attempt with ID {attempt_id} not found.",
            )
        if attempt.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to complete this attempt.",
            )

        # Safeguard 1 & 2: Status check
        if attempt.status != "in_progress":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot complete lesson: attempt status is already '{attempt.status}'.",
            )

        lesson = attempt.lesson
        skill = lesson.skill if lesson else None
        unit = skill.unit if skill else None
        course = unit.course if unit else None

        # Safeguard 5: Hearts check
        stats_stmt = select(LearnerStats).where(LearnerStats.user_id == user_id)
        learner_stats = db.scalars(stats_stmt).first()
        if not learner_stats:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Learner stats not found.",
            )
        if learner_stats.hearts <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot complete lesson: learner is out of hearts.",
            )

        # Safeguard 1: Exercise submission completeness check
        submitted_exercise_ids = set(
            db.scalars(
                select(ExerciseAttempt.exercise_id)
                .where(ExerciseAttempt.lesson_attempt_id == attempt_id)
                .distinct()
            ).all()
        )
        total_lesson_exercises = len(lesson.exercises)
        if len(submitted_exercise_ids) < total_lesson_exercises:
            missing_count = total_lesson_exercises - len(submitted_exercise_ids)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot complete lesson: {missing_count} exercises have not yet been submitted.",
            )

        # 2. Check if this lesson was already completed by this user (Replay Rule - Safeguard 4)
        prior_completed_count = db.scalar(
            select(func.count(LessonAttempt.id)).where(
                LessonAttempt.user_id == user_id,
                LessonAttempt.lesson_id == lesson.id,
                LessonAttempt.status == "completed",
                LessonAttempt.id != attempt.id,
            )
        ) or 0
        is_replay = (prior_completed_count > 0)

        # 3. Calculate Authoritative XP
        if is_replay:
            base_xp = 5
            accuracy_bonus_xp = 0
            total_xp_awarded = 5
        else:
            base_xp = lesson.xp_reward
            accuracy_bonus_xp = 5 if attempt.hearts_lost == 0 else 0
            total_xp_awarded = base_xp + accuracy_bonus_xp

        # 4. Calculate Score
        score = int(100 * max(0, total_lesson_exercises - attempt.hearts_lost) / max(1, total_lesson_exercises))

        # 5. Deterministic Streak & DailyActivity Updates (Safeguard 3)
        today_date = now_utc.date()
        today_act_stmt = select(DailyActivity).where(
            DailyActivity.user_id == user_id,
            DailyActivity.activity_date == today_date,
        )
        today_activity = db.scalars(today_act_stmt).first()

        is_streak_extended = False
        if today_activity:
            # Activity already logged today -> do not advance streak again
            today_activity.xp_earned += total_xp_awarded
            today_activity.lessons_completed += 1
            today_activity.active = True
        else:
            # First activity of the calendar day -> evaluate streak
            if learner_stats.last_activity_at:
                last_date = learner_stats.last_activity_at.date()
                days_diff = (today_date - last_date).days
                if days_diff == 1:
                    learner_stats.current_streak += 1
                    is_streak_extended = True
                elif days_diff == 0:
                    is_streak_extended = False
                elif days_diff == 2:
                    # Missed yesterday: check for available streak freeze (Phase 5)
                    if getattr(learner_stats, "streak_freeze_count", 0) > 0:
                        learner_stats.streak_freeze_count -= 1
                        learner_stats.current_streak += 1
                        is_streak_extended = True
                    else:
                        learner_stats.current_streak = 1
                        is_streak_extended = True
                else:
                    learner_stats.current_streak = 1
                    is_streak_extended = True
            else:
                learner_stats.current_streak = 1
                is_streak_extended = True

            # Insert DailyActivity for today
            today_activity = DailyActivity(
                user_id=user_id,
                activity_date=today_date,
                xp_earned=total_xp_awarded,
                lessons_completed=1,
                minutes_practiced=3,
                active=True,
                created_at=now_utc,
            )
            db.add(today_activity)

        learner_stats.longest_streak = max(learner_stats.longest_streak, learner_stats.current_streak)
        learner_stats.total_xp += total_xp_awarded
        learner_stats.last_activity_at = now_utc

        # Practice for Heart Recovery (Phase 5 rule: successful replay with score >= 80 recovers +1 heart)
        if is_replay and score >= 80 and learner_stats.hearts < learner_stats.max_hearts:
            learner_stats.hearts = min(learner_stats.max_hearts, learner_stats.hearts + 1)
            learner_stats.hearts_updated_at = now_utc

        # 6. Skill Progression & Unlocking (Safeguard 4)
        skill_completed = False
        crown_level = 0
        unlocked_skill_title: Optional[str] = None
        next_lesson_id: Optional[int] = None

        if skill:
            prog_stmt = select(UserSkillProgress).where(
                UserSkillProgress.user_id == user_id,
                UserSkillProgress.skill_id == skill.id,
            )
            user_prog = db.scalars(prog_stmt).first()
            if not user_prog:
                user_prog = UserSkillProgress(
                    user_id=user_id,
                    skill_id=skill.id,
                    status=SkillStatus.UNLOCKED.value,
                    is_unlocked=True,
                    completed=False,
                    crown_level=0,
                    xp_earned=0,
                    lessons_completed=0,
                    created_at=now_utc,
                    updated_at=now_utc,
                )
                db.add(user_prog)
                db.flush()

            if not is_replay:
                # Query all distinct completed lessons for this skill
                distinct_completed_in_skill = set(
                    db.scalars(
                        select(LessonAttempt.lesson_id)
                        .join(Lesson, LessonAttempt.lesson_id == Lesson.id)
                        .where(
                            LessonAttempt.user_id == user_id,
                            Lesson.skill_id == skill.id,
                            LessonAttempt.status == "completed",
                        )
                    ).all()
                )
                distinct_completed_in_skill.add(lesson.id)

                user_prog.lessons_completed = len(distinct_completed_in_skill)
                user_prog.xp_earned += total_xp_awarded
                user_prog.last_practiced_at = now_utc
                user_prog.updated_at = now_utc

                total_skill_lessons = len(skill.lessons)
                if user_prog.lessons_completed >= total_skill_lessons:
                    user_prog.completed = True
                    user_prog.status = SkillStatus.COMPLETED.value
                    user_prog.crown_level = max(1, user_prog.crown_level)
                    skill_completed = True

                    # Unlock Next Skill Island in Course Sequence
                    # A. Try next skill in same unit
                    next_skill_stmt = (
                        select(Skill)
                        .where(
                            Skill.unit_id == skill.unit_id,
                            Skill.order_index == skill.order_index + 1,
                        )
                    )
                    next_skill = db.scalars(next_skill_stmt).first()

                    # B. If end of unit, try first skill of next unit
                    if not next_skill and unit and course:
                        next_unit_stmt = (
                            select(Unit)
                            .where(
                                Unit.course_id == course.id,
                                Unit.order_index == unit.order_index + 1,
                            )
                        )
                        next_unit = db.scalars(next_unit_stmt).first()
                        if next_unit:
                            first_skill_stmt = (
                                select(Skill)
                                .where(Skill.unit_id == next_unit.id)
                                .order_by(Skill.order_index.asc())
                            )
                            next_skill = db.scalars(first_skill_stmt).first()

                    if next_skill:
                        next_prog_stmt = select(UserSkillProgress).where(
                            UserSkillProgress.user_id == user_id,
                            UserSkillProgress.skill_id == next_skill.id,
                        )
                        next_prog = db.scalars(next_prog_stmt).first()
                        if not next_prog:
                            next_prog = UserSkillProgress(
                                user_id=user_id,
                                skill_id=next_skill.id,
                                status=SkillStatus.UNLOCKED.value,
                                is_unlocked=True,
                                completed=False,
                                crown_level=0,
                                xp_earned=0,
                                lessons_completed=0,
                                created_at=now_utc,
                                updated_at=now_utc,
                            )
                            db.add(next_prog)
                        else:
                            next_prog.is_unlocked = True
                            if next_prog.status == SkillStatus.LOCKED.value:
                                next_prog.status = SkillStatus.UNLOCKED.value
                            next_prog.updated_at = now_utc

                        unlocked_skill_title = next_skill.title
                else:
                    user_prog.status = SkillStatus.IN_PROGRESS.value

            crown_level = user_prog.crown_level

        # 7. Finalize LessonAttempt
        attempt.status = "completed"
        attempt.score = score
        attempt.xp_earned = total_xp_awarded
        attempt.completed_at = now_utc

        db.commit()
        db.refresh(learner_stats)

        # 8. Evaluate Achievement Milestones (Phase 5)
        try:
            from app.services.gamification_service import GamificationService
            GamificationService.evaluate_achievements(db, user_id=user_id)
            db.refresh(learner_stats)
        except Exception:
            pass

        return LessonCompletionResponse(
            attempt_id=attempt.id,
            lesson_id=lesson.id,
            lesson_title=lesson.title,
            status="completed",
            score=score,
            base_xp=base_xp,
            accuracy_bonus_xp=accuracy_bonus_xp,
            total_xp_awarded=total_xp_awarded,
            is_replay=is_replay,
            hearts_remaining=learner_stats.hearts,
            current_streak=learner_stats.current_streak,
            is_streak_extended=is_streak_extended,
            skill_completed=skill_completed,
            crown_level=crown_level,
            unlocked_skill_title=unlocked_skill_title,
            next_lesson_id=next_lesson_id,
        )

    @classmethod
    def abandon_lesson(
        cls, db: Session, attempt_id: int, user_id: int
    ) -> LessonAbandonResponse:
        """Marks an active lesson attempt as abandoned without penalty."""
        attempt = db.get(LessonAttempt, attempt_id)
        if not attempt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lesson attempt with ID {attempt_id} not found.",
            )
        if attempt.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to abandon this attempt.",
            )

        if attempt.status == "in_progress":
            attempt.status = "abandoned"
            attempt.completed_at = datetime.now(timezone.utc)
            db.commit()

        stats_stmt = select(LearnerStats).where(LearnerStats.user_id == user_id)
        learner_stats = db.scalars(stats_stmt).first()

        return LessonAbandonResponse(
            attempt_id=attempt.id,
            lesson_id=attempt.lesson_id,
            status=attempt.status,
            hearts_remaining=learner_stats.hearts if learner_stats else 4,
        )
