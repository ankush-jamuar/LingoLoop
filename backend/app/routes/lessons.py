from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.lesson_session import (
    ExerciseValidationResponse,
    LessonAbandonResponse,
    LessonCompletionResponse,
    LessonSessionResponse,
    StartLessonRequest,
    SubmitAnswerRequest,
)
from app.services.lesson_service import LessonService

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.post("/{lesson_id}/start", response_model=LessonSessionResponse)
def start_lesson(
    lesson_id: int,
    request: Optional[StartLessonRequest] = None,
    email: Optional[str] = Query(None, description="Optional learner email override"),
    db: Session = Depends(get_db),
) -> LessonSessionResponse:
    """
    Initializes or resumes an in-progress lesson session.
    Sanitizes exercise payloads to remove any leaked secret answers.
    """
    target_email = (request.email if request and request.email else email)
    user = LessonService.get_user_by_email_or_default(db, email=target_email)
    return LessonService.start_lesson(db, lesson_id=lesson_id, user_id=user.id)


@router.post("/{attempt_id}/submit-exercise", response_model=ExerciseValidationResponse)
def submit_exercise_answer(
    attempt_id: int,
    request: SubmitAnswerRequest,
    email: Optional[str] = Query(None, description="Optional learner email override"),
    db: Session = Depends(get_db),
) -> ExerciseValidationResponse:
    """
    Authoritatively validates an exercise answer against database ground truth.
    Decrements hearts on wrong submission and logs ExerciseAttempt.
    """
    user = LessonService.get_user_by_email_or_default(db, email=email)
    return LessonService.submit_exercise_answer(
        db, attempt_id=attempt_id, request=request, user_id=user.id
    )


@router.post("/{attempt_id}/complete", response_model=LessonCompletionResponse)
def complete_lesson(
    attempt_id: int,
    email: Optional[str] = Query(None, description="Optional learner email override"),
    db: Session = Depends(get_db),
) -> LessonCompletionResponse:
    """
    Finalizes a completed lesson session.
    Validates completeness, awards authoritative XP, and updates streak & skill progression.
    """
    user = LessonService.get_user_by_email_or_default(db, email=email)
    return LessonService.complete_lesson(db, attempt_id=attempt_id, user_id=user.id)


@router.post("/{attempt_id}/abandon", response_model=LessonAbandonResponse)
def abandon_lesson(
    attempt_id: int,
    email: Optional[str] = Query(None, description="Optional learner email override"),
    db: Session = Depends(get_db),
) -> LessonAbandonResponse:
    """
    Abandons an in-progress lesson session.
    """
    user = LessonService.get_user_by_email_or_default(db, email=email)
    return LessonService.abandon_lesson(db, attempt_id=attempt_id, user_id=user.id)
