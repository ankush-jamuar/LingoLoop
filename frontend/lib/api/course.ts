import { apiFetch } from "./client";

export interface CourseSummary {
  id: number;
  name: string;
  source_language: string;
  target_language: string;
  description: string | null;
  order_index: number;
  is_active: boolean;
}

export interface LessonSummary {
  id: number;
  skill_id: number;
  title: string;
  order_index: number;
  xp_reward: number;
  is_completed: boolean;
}

export interface SkillMapNode {
  id: number;
  unit_id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  icon_key: string;
  order_index: number;
  xp_reward: number;
  is_locked_by_default: boolean;
  status: "locked" | "unlocked" | "in_progress" | "completed" | "mastered" | string;
  is_unlocked: boolean;
  completed: boolean;
  crown_level: number;
  lessons_completed: number;
  total_lessons: number;
  xp_earned: number;
  lessons: LessonSummary[];
}

export interface UnitMapSection {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  order_index: number;
  skills: SkillMapNode[];
}

export interface LoopMap {
  course_id: number;
  course_name: string;
  source_language: string;
  target_language: string;
  description: string | null;
  units: UnitMapSection[];
}

export interface SkillDetail {
  id: number;
  unit_id: number;
  unit_title: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  icon_key: string;
  order_index: number;
  xp_reward: number;
  status: string;
  is_unlocked: boolean;
  completed: boolean;
  crown_level: number;
  lessons_completed: number;
  total_lessons: number;
  xp_earned: number;
  lessons: LessonSummary[];
}

/**
 * Fetches the active language course metadata.
 * Target: GET /api/courses/active
 */
export async function getActiveCourse(): Promise<CourseSummary> {
  return apiFetch<CourseSummary>("/api/courses/active", {
    method: "GET",
    cache: "no-store",
  });
}

/**
 * Fetches the complete Loop Map hierarchy with learner progress.
 * Target: GET /api/courses/{courseId}/map
 */
export async function getLoopMap(courseId: number): Promise<LoopMap> {
  return apiFetch<LoopMap>(`/api/courses/${courseId}/map`, {
    method: "GET",
    cache: "no-store",
  });
}

/**
 * Fetches full details for a specific skill.
 * Target: GET /api/skills/{skillId}
 */
export async function getSkillDetail(skillId: number): Promise<SkillDetail> {
  return apiFetch<SkillDetail>(`/api/skills/${skillId}`, {
    method: "GET",
    cache: "no-store",
  });
}
