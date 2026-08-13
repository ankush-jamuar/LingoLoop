from enum import Enum
from typing import Any
from pydantic import BaseModel, Field, field_validator, model_validator


class ExerciseType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    TRANSLATE = "translate"
    MATCH_PAIRS = "match_pairs"
    FILL_BLANK = "fill_blank"
    TYPE_ANSWER = "type_answer"


class MultipleChoiceOption(BaseModel):
    id: str = Field(..., description="Unique option identifier within the exercise")
    text: str = Field(..., min_length=1, description="Option display text")


class MultipleChoiceContent(BaseModel):
    options: list[MultipleChoiceOption] = Field(..., min_length=2, description="List of selectable options")
    correctOptionId: str = Field(..., description="ID of the single correct option")

    @model_validator(mode="after")
    def verify_correct_option_exists(self) -> "MultipleChoiceContent":
        option_ids = {opt.id for opt in self.options}
        if self.correctOptionId not in option_ids:
            raise ValueError(f"correctOptionId '{self.correctOptionId}' must match one of the option IDs: {option_ids}")
        return self


class TranslateContent(BaseModel):
    sourceText: str = Field(..., min_length=1, description="Source sentence or phrase to translate")
    acceptedAnswers: list[str] = Field(..., min_length=1, description="List of acceptable target translations")
    wordBank: list[str] = Field(..., min_length=1, description="Tokens available in the interactive word bank")


class MatchPairItem(BaseModel):
    left: str = Field(..., min_length=1, description="Left prompt token")
    right: str = Field(..., min_length=1, description="Right matching token")


class MatchPairsContent(BaseModel):
    pairs: list[MatchPairItem] = Field(..., min_length=2, description="Pairs of associated tokens to match")


class FillBlankContent(BaseModel):
    sentence: str = Field(..., min_length=3, description="Sentence containing a blank token indicated by '___'")
    acceptedAnswers: list[str] = Field(..., min_length=1, description="List of acceptable answers to fill the blank")

    @field_validator("sentence")
    @classmethod
    def verify_blank_placeholder(cls, v: str) -> str:
        if "___" not in v:
            raise ValueError("Fill-blank sentence must contain '___' to indicate the missing word")
        return v


class TypeAnswerContent(BaseModel):
    acceptedAnswers: list[str] = Field(..., min_length=1, description="List of acceptable typed translations/answers")
    caseSensitive: bool = Field(False, description="Whether checking should be case-sensitive")


CONTENT_SCHEMA_MAP: dict[str, type[BaseModel]] = {
    ExerciseType.MULTIPLE_CHOICE.value: MultipleChoiceContent,
    ExerciseType.TRANSLATE.value: TranslateContent,
    ExerciseType.MATCH_PAIRS.value: MatchPairsContent,
    ExerciseType.FILL_BLANK.value: FillBlankContent,
    ExerciseType.TYPE_ANSWER.value: TypeAnswerContent,
}


def validate_exercise_content(exercise_type: str, payload: dict[str, Any] | Any) -> dict[str, Any]:
    """Validates an exercise content dictionary against its typed Pydantic schema."""
    schema_cls = CONTENT_SCHEMA_MAP.get(exercise_type)
    if not schema_cls:
        valid_types = list(CONTENT_SCHEMA_MAP.keys())
        raise ValueError(f"Unknown exercise type '{exercise_type}'. Expected one of: {valid_types}")

    if isinstance(payload, dict):
        validated_model = schema_cls.model_validate(payload)
    else:
        validated_model = schema_cls.model_validate(payload)

    return validated_model.model_dump()
