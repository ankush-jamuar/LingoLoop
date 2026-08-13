from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.gamification import (
    AchievementsResponse,
    BuyStreakFreezeResponse,
    HeartStatusResponse,
    LeaderboardResponse,
    RefillHeartsResponse,
)
from app.services.gamification_service import GamificationService
from app.services.learner_service import LearnerService

router = APIRouter(prefix="/gamification", tags=["gamification"])


@router.get("/hearts/status", response_model=HeartStatusResponse)
def get_heart_status(
    email: Optional[str] = Query(None, description="Optional learner email override"),
    db: Session = Depends(get_db),
) -> HeartStatusResponse:
    """
    Returns current heart balance and evaluates time-based heart regeneration.
    """
    user = LearnerService.get_user_by_email_or_default(db, email=email)
    return GamificationService.evaluate_heart_regen(db, user_id=user.id)


@router.post("/shop/refill-hearts", response_model=RefillHeartsResponse)
def refill_hearts(
    email: Optional[str] = Query(None, description="Optional learner email override"),
    db: Session = Depends(get_db),
) -> RefillHeartsResponse:
    """
    Deducts 50 Sparks and refills learner's hearts to 5/5.
    """
    user = LearnerService.get_user_by_email_or_default(db, email=email)
    return GamificationService.refill_hearts(db, user_id=user.id)


@router.post("/shop/buy-streak-freeze", response_model=BuyStreakFreezeResponse)
def buy_streak_freeze(
    email: Optional[str] = Query(None, description="Optional learner email override"),
    db: Session = Depends(get_db),
) -> BuyStreakFreezeResponse:
    """
    Deducts 100 Sparks and purchases a Streak Freeze shield (max 2 capacity).
    """
    user = LearnerService.get_user_by_email_or_default(db, email=email)
    return GamificationService.buy_streak_freeze(db, user_id=user.id)


@router.get("/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard(
    email: Optional[str] = Query(None, description="Optional learner email override"),
    db: Session = Depends(get_db),
) -> LeaderboardResponse:
    """
    Returns the active weekly Silver Loop League leaderboard rankings.
    Ranked strictly by weekly XP earned from DailyActivity in the current calendar week.
    """
    user = LearnerService.get_user_by_email_or_default(db, email=email)
    return GamificationService.get_leaderboard(db, user_id=user.id)


@router.get("/achievements", response_model=AchievementsResponse)
def get_achievements(
    email: Optional[str] = Query(None, description="Optional learner email override"),
    db: Session = Depends(get_db),
) -> AchievementsResponse:
    """
    Returns all achievement milestones, progress, and unlock statuses for the learner.
    """
    user = LearnerService.get_user_by_email_or_default(db, email=email)
    return GamificationService.get_achievements(db, user_id=user.id)
