from typing import Optional
from pydantic import BaseModel, ConfigDict


class CourseSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    source_language: str
    target_language: str
    description: Optional[str] = None
    order_index: int
    is_active: bool


class LessonSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    skill_id: int
    title: str
    order_index: int
    xp_reward: int
    is_completed: bool = False


class SkillMapNode(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    unit_id: int
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    icon_key: str
    order_index: int
    xp_reward: int
    is_locked_by_default: bool
    status: str  # "locked" | "unlocked" | "in_progress" | "completed" | "mastered"
    is_unlocked: bool
    completed: bool
    crown_level: int
    lessons_completed: int
    total_lessons: int
    xp_earned: int
    lessons: list[LessonSummary]


class UnitMapSection(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    course_id: int
    title: str
    description: Optional[str] = None
    order_index: int
    skills: list[SkillMapNode]


class LoopMapResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    course_id: int
    course_name: str
    source_language: str
    target_language: str
    description: Optional[str] = None
    units: list[UnitMapSection]


class SkillDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    unit_id: int
    unit_title: str
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    icon_key: str
    order_index: int
    xp_reward: int
    status: str
    is_unlocked: bool
    completed: bool
    crown_level: int
    lessons_completed: int
    total_lessons: int
    xp_earned: int
    lessons: list[LessonSummary]
