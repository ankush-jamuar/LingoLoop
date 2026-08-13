from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.learner import LearnerProfileResponse
from app.schemas.progression import NextLessonResponse
from app.services.learner_service import LearnerService

router = APIRouter(prefix="/learners", tags=["learners"])


@router.get("/current", response_model=LearnerProfileResponse)
def get_current_learner(
    email: Optional[str] = Query(None, description="Optional learner email"),
    db: Session = Depends(get_db),
) -> LearnerProfileResponse:
    """Retrieves active learner profile and aggregate stats."""
    learner = LearnerService.get_current_learner(db, email=email)
    if not learner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No learner profile found. Please run seed script.",
        )
    return learner


@router.get("/current/next-lesson", response_model=NextLessonResponse)
def get_next_lesson(
    email: Optional[str] = Query(None, description="Optional learner email"),
    db: Session = Depends(get_db),
) -> NextLessonResponse:
    """Calculates the next recommended lesson for the learner."""
    learner = LearnerService.get_current_learner(db, email=email)
    if not learner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No learner found to calculate next lesson.",
        )

    next_lesson = LearnerService.get_next_lesson(db, user_id=learner.id)
    if not next_lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No actionable next lesson found.",
        )
    return next_lesson
