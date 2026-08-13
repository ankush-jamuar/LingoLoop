from pydantic import BaseModel, ConfigDict


class NextLessonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    course_id: int
    course_name: str
    unit_id: int
    unit_title: str
    skill_id: int
    skill_title: str
    skill_icon_key: str
    lesson_id: int
    lesson_title: str
    lesson_order_index: int
    xp_reward: int
    crown_level: int
    skill_status: str
