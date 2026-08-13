from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class HeartStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    hearts: int = Field(..., description="Current hearts count (0..5)")
    max_hearts: int = Field(default=5, description="Maximum hearts capacity")
    hearts_updated_at: datetime = Field(..., description="Timestamp when hearts were last evaluated")
    seconds_until_next_heart: Optional[int] = Field(
        None, description="Seconds until next heart regenerates, or None if at max hearts"
    )
    can_refill_with_sparks: bool = Field(..., description="Whether learner has enough sparks to refill")
    sparks_refill_cost: int = Field(default=50, description="Cost in sparks to refill hearts")
    sparks_balance: int = Field(..., description="Learner's current sparks (gems) balance")
    streak_freeze_count: int = Field(default=0, description="Stored streak freeze shields (0..2)")
    max_streak_freezes: int = Field(default=2, description="Maximum stored streak freeze shields")


class RefillHeartsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    success: bool = True
    hearts: int
    max_hearts: int
    sparks_spent: int = 50
    sparks_remaining: int
    message: str = "Hearts successfully refilled to maximum!"


class BuyStreakFreezeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    success: bool = True
    streak_freeze_count: int
    max_streak_freezes: int = 2
    sparks_spent: int = 100
    sparks_remaining: int
    message: str = "Streak Freeze equipped! Your next missed day will be protected."


class LeaderboardEntry(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    rank: int = Field(..., description="Rank in current league cohort (1-indexed)")
    user_id: int
    name: str
    avatar_key: str
    weekly_xp: int = Field(..., description="Momentum XP earned in the current calendar week")
    current_streak: int
    is_current_user: bool = False
    zone: str = Field(..., description="'podium' | 'promotion' | 'safe' | 'demotion'")


class LeaderboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    tier_name: str = "Silver Loop"
    cycle_starts_at: datetime
    cycle_ends_at: datetime
    user_rank: int
    user_weekly_xp: int
    promotion_cutoff: int = 4
    demotion_cutoff: int = 9
    entries: List[LeaderboardEntry]


class AchievementItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    key: str
    title: str
    description: str
    icon_key: str
    reward_sparks: int
    is_unlocked: bool
    unlocked_at: Optional[datetime] = None
    progress: int = Field(default=0, description="Progress towards achievement (0..100)")


class AchievementsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_achievements: int
    unlocked_count: int
    achievements: List[AchievementItem]
