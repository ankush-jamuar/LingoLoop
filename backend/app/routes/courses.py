from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.course import (
    CourseSummaryResponse,
    LoopMapResponse,
    SkillDetailResponse,
)
from app.services.course_service import CourseService
from app.services.learner_service import LearnerService

router = APIRouter(tags=["courses"])


@router.get("/courses/active", response_model=CourseSummaryResponse)
def get_active_course(db: Session = Depends(get_db)) -> CourseSummaryResponse:
    """Retrieves the active language course."""
    course = CourseService.get_active_course(db)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active language course found. Please seed the database.",
        )
    return CourseSummaryResponse.model_validate(course)


@router.get("/courses/{course_id}/map", response_model=LoopMapResponse)
def get_course_loop_map(
    course_id: int,
    email: Optional[str] = Query(None, description="Optional learner email filter"),
    db: Session = Depends(get_db),
) -> LoopMapResponse:
    """Retrieves the full Loop Map hierarchy (units, skills, lessons) with learner progress."""
    learner = LearnerService.get_current_learner(db, email=email)
    user_id = learner.id if learner else 1

    loop_map = CourseService.get_course_loop_map(db, course_id=course_id, user_id=user_id)
    if not loop_map:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID {course_id} not found.",
        )
    return loop_map


@router.get("/skills/{skill_id}", response_model=SkillDetailResponse)
def get_skill_detail(
    skill_id: int,
    email: Optional[str] = Query(None, description="Optional learner email filter"),
    db: Session = Depends(get_db),
) -> SkillDetailResponse:
    """Retrieves detailed skill metadata, lesson list, and user progress."""
    learner = LearnerService.get_current_learner(db, email=email)
    user_id = learner.id if learner else 1

    skill_detail = CourseService.get_skill_detail(db, skill_id=skill_id, user_id=user_id)
    if not skill_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skill with ID {skill_id} not found.",
        )
    return skill_detail
