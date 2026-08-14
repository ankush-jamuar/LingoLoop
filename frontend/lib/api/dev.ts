import { apiFetch } from "./client";

export interface DevResetResult {
  success: boolean;
  message: string;
  learner: {
    name: string;
    email: string;
    total_xp: number;
    hearts: number;
    max_hearts: number;
    gems: number;
    streak: number;
    streak_freezes: number;
    skills_unlocked: number;
  };
}

export async function resetDevProgress(): Promise<DevResetResult> {
  return apiFetch<DevResetResult>("/api/dev/reset-progress", {
    method: "POST",
  });
}
