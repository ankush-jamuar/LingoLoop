import { apiFetch } from "./client";

export interface LearnerStats {
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  hearts: number;
  max_hearts: number;
  gems: number;
  daily_goal_xp: number;
  last_activity_at: string | null;
}

export interface LearnerProfile {
  id: number;
  name: string;
  email: string;
  avatar_key: string;
  stats: LearnerStats;
}

export interface NextLesson {
  course_id: number;
  course_name: string;
  unit_id: number;
  unit_title: string;
  skill_id: number;
  skill_title: string;
  skill_icon_key: string;
  lesson_id: number;
  lesson_title: string;
  lesson_order_index: number;
  xp_reward: number;
  crown_level: number;
  skill_status: string;
}

/**
 * Fetches the active learner profile and aggregate stats.
 * Target: GET /api/learners/current
 */
export async function getCurrentLearner(): Promise<LearnerProfile> {
  return apiFetch<LearnerProfile>("/api/learners/current", {
    method: "GET",
    cache: "no-store",
  });
}

/**
 * Calculates and fetches the next recommended lesson for the learner.
 * Target: GET /api/learners/current/next-lesson
 */
export async function getNextLesson(): Promise<NextLesson> {
  return apiFetch<NextLesson>("/api/learners/current/next-lesson", {
    method: "GET",
    cache: "no-store",
  });
}
