import { apiFetch } from "./client";

export interface HeartStatus {
  hearts: number;
  max_hearts: number;
  hearts_updated_at: string;
  seconds_until_next_heart: number | null;
  can_refill_with_sparks: boolean;
  sparks_refill_cost: number;
  sparks_balance: number;
  streak_freeze_count: number;
  max_streak_freezes: number;
}

export interface RefillHeartsResult {
  success: boolean;
  hearts: number;
  max_hearts: number;
  sparks_spent: number;
  sparks_remaining: number;
  message: string;
}

export interface BuyStreakFreezeResult {
  success: boolean;
  streak_freeze_count: number;
  max_streak_freezes: number;
  sparks_spent: number;
  sparks_remaining: number;
  message: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  name: string;
  avatar_key: string;
  weekly_xp: number;
  current_streak: number;
  is_current_user: boolean;
  zone: "podium" | "promotion" | "safe" | "demotion";
}

export interface LeaderboardData {
  tier_name: string;
  cycle_starts_at: string;
  cycle_ends_at: string;
  user_rank: number;
  user_weekly_xp: number;
  promotion_cutoff: number;
  demotion_cutoff: number;
  entries: LeaderboardEntry[];
}

export interface AchievementItem {
  id: number;
  key: string;
  title: string;
  description: string;
  icon_key: string;
  reward_sparks: number;
  is_unlocked: boolean;
  unlocked_at: string | null;
  progress: number;
}

export interface AchievementsData {
  total_achievements: number;
  unlocked_count: number;
  achievements: AchievementItem[];
}

/**
 * Evaluates and fetches current heart balance and regen countdown.
 * Target: GET /api/gamification/hearts/status
 */
export async function getHeartStatus(email?: string): Promise<HeartStatus> {
  const query = email ? `?email=${encodeURIComponent(email)}` : "";
  return apiFetch<HeartStatus>(`/api/gamification/hearts/status${query}`);
}

/**
 * Purchases an instant hearts refill for 50 Sparks.
 * Target: POST /api/gamification/shop/refill-hearts
 */
export async function refillHearts(email?: string): Promise<RefillHeartsResult> {
  const query = email ? `?email=${encodeURIComponent(email)}` : "";
  return apiFetch<RefillHeartsResult>(`/api/gamification/shop/refill-hearts${query}`, {
    method: "POST",
  });
}

/**
 * Purchases a streak freeze shield for 100 Sparks.
 * Target: POST /api/gamification/shop/buy-streak-freeze
 */
export async function buyStreakFreeze(email?: string): Promise<BuyStreakFreezeResult> {
  const query = email ? `?email=${encodeURIComponent(email)}` : "";
  return apiFetch<BuyStreakFreezeResult>(`/api/gamification/shop/buy-streak-freeze${query}`, {
    method: "POST",
  });
}

/**
 * Fetches the active Silver Loop League weekly standings.
 * Target: GET /api/gamification/leaderboard
 */
export async function getLeaderboard(email?: string): Promise<LeaderboardData> {
  const query = email ? `?email=${encodeURIComponent(email)}` : "";
  return apiFetch<LeaderboardData>(`/api/gamification/leaderboard${query}`);
}

/**
 * Fetches all milestone achievements with unlock and progress status.
 * Target: GET /api/gamification/achievements
 */
export async function getAchievements(email?: string): Promise<AchievementsData> {
  const query = email ? `?email=${encodeURIComponent(email)}` : "";
  return apiFetch<AchievementsData>(`/api/gamification/achievements${query}`);
}
