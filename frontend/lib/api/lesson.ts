import { apiFetch } from "./client";

export interface SanitizedExerciseOption {
  id: string;
  text: string;
}

export interface SanitizedExercise {
  id: number;
  lesson_id: number;
  type: "multiple_choice" | "translate" | "match_pairs" | "fill_blank" | "type_answer" | string;
  prompt: string;
  instruction: string | null;
  order_index: number;
  xp_reward: number;
  options?: SanitizedExerciseOption[];
  source_text?: string;
  word_bank?: string[];
  pair_left_tokens?: string[];
  pair_right_tokens?: string[];
  sentence_template?: string;
}

export interface LessonSession {
  attempt_id: number;
  lesson_id: number;
  lesson_title: string;
  skill_id: number;
  skill_title: string;
  course_id: number;
  hearts_remaining: number;
  max_hearts: number;
  total_exercises: number;
  is_resumed: boolean;
  exercises: SanitizedExercise[];
}

export interface MatchedPairItem {
  left: string;
  right: string;
}

export interface SubmitAnswerPayload {
  exercise_id: number;
  selected_option_id?: string;
  translated_tokens?: string[];
  matched_pairs?: MatchedPairItem[];
  typed_answer?: string;
}

export interface ExerciseValidationResult {
  attempt_id: number;
  exercise_id: number;
  is_correct: boolean;
  attempt_number: number;
  xp_earned: number;
  hearts_remaining: number;
  correct_answer_display?: string | null;
  explanation?: string | null;
  is_lesson_failed: boolean;
}

export interface LessonCompletionResult {
  attempt_id: number;
  lesson_id: number;
  lesson_title: string;
  status: string;
  score: number;
  base_xp: number;
  accuracy_bonus_xp: number;
  total_xp_awarded: number;
  is_replay: boolean;
  hearts_remaining: number;
  current_streak: number;
  is_streak_extended: boolean;
  skill_completed: boolean;
  crown_level: number;
  unlocked_skill_title?: string | null;
  next_lesson_id?: number | null;
}

export interface LessonAbandonResult {
  attempt_id: number;
  lesson_id: number;
  status: string;
  hearts_remaining: number;
}

/**
 * Initializes or resumes a lesson session.
 * Target: POST /api/lessons/{lessonId}/start
 */
export async function startLesson(
  lessonId: number,
  email?: string
): Promise<LessonSession> {
  return apiFetch<LessonSession>(`/api/lessons/${lessonId}/start`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * Submits an exercise answer for authoritative backend validation.
 * Target: POST /api/lessons/{attemptId}/submit-exercise
 */
export async function submitExerciseAnswer(
  attemptId: number,
  payload: SubmitAnswerPayload
): Promise<ExerciseValidationResult> {
  return apiFetch<ExerciseValidationResult>(
    `/api/lessons/${attemptId}/submit-exercise`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

/**
 * Finalizes a completed lesson session.
 * Target: POST /api/lessons/{attemptId}/complete
 */
export async function completeLesson(
  attemptId: number
): Promise<LessonCompletionResult> {
  return apiFetch<LessonCompletionResult>(`/api/lessons/${attemptId}/complete`, {
    method: "POST",
  });
}

/**
 * Abandons an active lesson session.
 * Target: POST /api/lessons/{attemptId}/abandon
 */
export async function abandonLesson(
  attemptId: number
): Promise<LessonAbandonResult> {
  return apiFetch<LessonAbandonResult>(`/api/lessons/${attemptId}/abandon`, {
    method: "POST",
  });
}
