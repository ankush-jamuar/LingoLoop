from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class LearnerStatsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_xp: int
    current_streak: int
    longest_streak: int
    hearts: int
    max_hearts: int
    gems: int
    daily_goal_xp: int
    last_activity_at: Optional[datetime] = None


class LearnerProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    avatar_key: str
    stats: LearnerStatsResponse
