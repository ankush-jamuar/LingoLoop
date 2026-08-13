# LingoLoop Seed Data (Phase 2)

This directory contains the database initialization and seed data scripts for LingoLoop.

## Seed Execution

To seed the local SQLite database, run the following command from the repository or `backend/` directory:

```bash
cd backend
python -m seed.seed
```

### Idempotency Guarantee
The seed script (`seed.py`) is completely **idempotent**:
- Running it once creates all curriculum entities (Course, Units, Skills, Lessons, Exercises), default achievements, and the seeded learner (**Ankush**).
- Running it multiple times detects existing records by unique keys (`email`, `(course_id, order_index)`, `(unit_id, order_index)`, etc.) and safely updates attributes without creating duplicate rows or primary key conflicts.

---

## Seeded Dataset Summary

| Entity | Seed Count | Description |
|---|---|---|
| **Course** | 1 | *Spanish for English Speakers* (English → Spanish) |
| **Units** | 3 | Unit 1 (First Connections), Unit 2 (Everyday Signals), Unit 3 (Daily Rhythm) |
| **Skills** | 9 | 3 skills per unit (First Words, Meet & Greet, Tiny Conversations, Food Signals, Useful Things, Around Town, Morning Rhythm, Daily Plans, Small Talk) |
| **Lessons** | 18 | 2 lessons per skill with explicit `order_index` sequencing |
| **Exercises** | 90 | 5 exercises per lesson across all 5 exercise formats (`multiple_choice`, `translate`, `match_pairs`, `fill_blank`, `type_answer`) |
| **Users** | 1 | Seeded learner **Ankush** (`ankush@lingoloop.local`) |
| **LearnerStats** | 1 | 120 total XP, 3 current streak, 5 longest streak, 4 hearts, 80 gems, 30 daily goal XP |
| **UserSkillProgress** | 9 | Unit 1 progression: *First Words* (completed, 2/2 lessons, crown 1), *Meet & Greet* (in_progress, 1/2 lessons, crown 1), *Tiny Conversations* (unlocked), remaining 6 skills locked |
| **DailyActivity** | 3 | 3 consecutive active days demonstrating a 3-day streak |
| **Achievements** | 3 | *First Loop* (unlocked), *Momentum Builder* (unlocked), *Three-Day Loop* (locked) |
| **UserAchievements** | 2 | Unlocked achievements for Ankush |
| **LessonAttempts** | 2 | Completed attempts for First Words lessons |
| **ExerciseAttempts** | 10 | Completed exercise submissions |

---

## Typed Exercise Content Validation

Every exercise payload in the seed dataset is validated against typed Pydantic models in [`app.schemas.exercise_content`](file:///d:/LingoLoop/backend/app/schemas/exercise_content.py) before insertion:
- `multiple_choice`: `MultipleChoiceContent` (options + correctOptionId)
- `translate`: `TranslateContent` (sourceText + acceptedAnswers + wordBank)
- `match_pairs`: `MatchPairsContent` (pairs of left/right tokens)
- `fill_blank`: `FillBlankContent` (sentence with `___` + acceptedAnswers)
- `type_answer`: `TypeAnswerContent` (acceptedAnswers + caseSensitive boolean)
