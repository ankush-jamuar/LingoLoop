from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, Field


# -----------------------------------------------------------------------------
# Sanitized Exercise Schemas (No Leaked Secret Answers)
# -----------------------------------------------------------------------------

class SanitizedExerciseOption(BaseModel):
    id: str
    text: str


class SanitizedExercise(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lesson_id: int
    type: str  # "multiple_choice" | "translate" | "match_pairs" | "fill_blank" | "type_answer"
    prompt: str
    instruction: Optional[str] = None
    order_index: int
    xp_reward: int

    # Type-specific sanitized payloads (NO correctOptionId / acceptedAnswers / answer keys)
    options: Optional[list[SanitizedExerciseOption]] = None
    source_text: Optional[str] = None
    word_bank: Optional[list[str]] = None
    pair_left_tokens: Optional[list[str]] = None
    pair_right_tokens: Optional[list[str]] = None
    sentence_template: Optional[str] = None


class LessonSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    attempt_id: int
    lesson_id: int
    lesson_title: str
    skill_id: int
    skill_title: str
    course_id: int
    hearts_remaining: int
    max_hearts: int
    total_exercises: int
    is_resumed: bool = False
    exercises: list[SanitizedExercise]


class StartLessonRequest(BaseModel):
    email: Optional[str] = None


# -----------------------------------------------------------------------------
# Submission & Validation Schemas
# -----------------------------------------------------------------------------

class MatchedPairSubmission(BaseModel):
    left: str
    right: str


class SubmitAnswerRequest(BaseModel):
    exercise_id: int
    # Flexible submission payload tailored to the exercise type
    selected_option_id: Optional[str] = None
    translated_tokens: Optional[list[str]] = None
    matched_pairs: Optional[list[MatchedPairSubmission]] = None
    typed_answer: Optional[str] = None


class ExerciseValidationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    attempt_id: int
    exercise_id: int
    is_correct: bool
    attempt_number: int
    xp_earned: int
    hearts_remaining: int
    correct_answer_display: Optional[str] = None
    explanation: Optional[str] = None
    is_lesson_failed: bool = False


# -----------------------------------------------------------------------------
# Completion Schemas
# -----------------------------------------------------------------------------

class LessonCompletionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    attempt_id: int
    lesson_id: int
    lesson_title: str
    status: str  # "completed"
    score: int
    base_xp: int
    accuracy_bonus_xp: int
    total_xp_awarded: int
    is_replay: bool
    hearts_remaining: int
    current_streak: int
    is_streak_extended: bool
    skill_completed: bool
    crown_level: int
    unlocked_skill_title: Optional[str] = None
    next_lesson_id: Optional[int] = None


class LessonAbandonResponse(BaseModel):
    attempt_id: int
    lesson_id: int
    status: str
    hearts_remaining: int
