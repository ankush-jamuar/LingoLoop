"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  getLeaderboard,
  LeaderboardData,
} from "@/lib/api/gamification";
import { getCurrentLearner, LearnerProfile } from "@/lib/api/learner";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonItem } from "@/components/ui/SkeletonLoader";
import {
  Trophy,
  Flame,
  ArrowUp,
  ArrowDown,
  Clock,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LeaderboardPage() {
  const [learner, setLearner] = useState<LearnerProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("3 days left");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [learnerData, lbData] = await Promise.all([
          getCurrentLearner(),
          getLeaderboard(),
        ]);
        if (!ignore) {
          setLearner(learnerData);
          setLeaderboard(lbData);
          if (lbData.cycle_ends_at) {
            const ends = new Date(lbData.cycle_ends_at).getTime();
            const now = Date.now();
            const diffMs = Math.max(0, ends - now);
            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            setTimeRemaining(days > 0 ? `${days}d ${hours}h left in cycle` : `${hours}h left in cycle`);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load Silver Loop League standings."
          );
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    Promise.all([getCurrentLearner(), getLeaderboard()])
      .then(([learnerData, lbData]) => {
        setLearner(learnerData);
        setLeaderboard(lbData);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load standings.");
        setIsLoading(false);
      });
  };

  const top3 = leaderboard?.entries.slice(0, 3) || [];

  return (
    <div className="flex min-h-screen flex-col bg-cream selection:bg-mint selection:text-ink font-body">
      {/* Top Navigation */}
      <Navbar learner={learner} onStatsUpdated={handleRetry} />

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-2xl space-y-6">
          {/* Header Banner */}
          <div className="surface-card rounded-3xl p-6 bg-white border-2 border-ink shadow-md text-center space-y-3 relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sun-subtle border-2 border-sun/50 text-ink text-xs font-extrabold font-display uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-sun fill-sun" />
              <span>Momentum League</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink font-display tracking-tight">
                Silver Loop League
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted font-body max-w-md mx-auto">
                Compete with learners in your cohort. Top 4 promote to Gold Loop at cycle end.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-xs font-bold font-display text-ink-muted">
              <div className="flex items-center gap-1.5 bg-cream-muted px-3 py-1 rounded-full border border-ink/10">
                <Clock className="w-3.5 h-3.5 text-ink-subtle" />
                <span>{timeRemaining}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-mint/50 text-mint-dark px-3 py-1 rounded-full border border-mint-dark/20">
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Top 4 Promote</span>
              </div>
            </div>
          </div>

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <SkeletonItem className="h-36 rounded-2xl" />
                <SkeletonItem className="h-44 rounded-2xl" />
                <SkeletonItem className="h-36 rounded-2xl" />
              </div>
              <SkeletonItem className="h-64 rounded-2xl" />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-6">
              <ErrorState
                title="Could not load leaderboard"
                message={error}
                onRetry={handleRetry}
              />
            </div>
          )}

          {/* Leaderboard Standings */}
          {!isLoading && leaderboard && (
            <div className="space-y-6">
              {/* Top 3 Podium Layout */}
              {top3.length === 3 && (
                <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-4 pb-2">
                  {/* Rank 2 (Silver) */}
                  <div className="surface-card rounded-2xl p-3 sm:p-4 bg-white border-2 border-ink/20 shadow-sm text-center space-y-2 flex flex-col items-center order-1">
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cream-muted border-2 border-ink/30 flex items-center justify-center font-extrabold text-lg sm:text-xl text-ink">
                        {top3[1].name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-ink/10 border border-ink/30 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-extrabold text-ink">
                        2
                      </div>
                    </div>
                    <div className="space-y-0.5 w-full overflow-hidden">
                      <p className="font-extrabold font-display text-xs sm:text-sm truncate text-ink">
                        {top3[1].name}
                      </p>
                      <p className="text-xs font-extrabold font-display text-violet">
                        {top3[1].weekly_xp} XP
                      </p>
                    </div>
                  </div>

                  {/* Rank 1 (Gold - Elevated) */}
                  <div className="surface-card rounded-2xl p-4 sm:p-5 bg-sun-subtle border-2 border-sun/70 shadow-md text-center space-y-2 flex flex-col items-center order-2 -mt-4 relative">
                    <div className="absolute -top-3.5 flex justify-center">
                      <Crown className="w-7 h-7 text-sun fill-sun" />
                    </div>
                    <div className="relative mt-1">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-sun/40 border-2 border-sun flex items-center justify-center font-extrabold text-xl sm:text-2xl text-ink shadow-inner">
                        {top3[0].name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-sun border-2 border-ink rounded-full w-6 h-6 flex items-center justify-center text-xs font-black text-ink shadow-xs">
                        1
                      </div>
                    </div>
                    <div className="space-y-0.5 w-full overflow-hidden">
                      <p className="font-extrabold font-display text-sm sm:text-base truncate text-ink">
                        {top3[0].name}
                      </p>
                      <p className="text-xs sm:text-sm font-extrabold font-display text-coral">
                        {top3[0].weekly_xp} XP
                      </p>
                    </div>
                  </div>

                  {/* Rank 3 (Bronze) */}
                  <div className="surface-card rounded-2xl p-3 sm:p-4 bg-white border-2 border-ink/20 shadow-sm text-center space-y-2 flex flex-col items-center order-3">
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cream-muted border-2 border-ink/30 flex items-center justify-center font-extrabold text-lg sm:text-xl text-ink">
                        {top3[2].name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-amber-700/20 border border-amber-800/40 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-extrabold text-amber-900">
                        3
                      </div>
                    </div>
                    <div className="space-y-0.5 w-full overflow-hidden">
                      <p className="font-extrabold font-display text-xs sm:text-sm truncate text-ink">
                        {top3[2].name}
                      </p>
                      <p className="text-xs font-extrabold font-display text-violet">
                        {top3[2].weekly_xp} XP
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Complete Ranking List */}
              <div className="surface-card rounded-3xl p-3 sm:p-4 bg-white border-2 border-ink shadow-md space-y-2">
                <div className="px-3 py-2 text-xs font-extrabold font-display text-ink-subtle uppercase tracking-wider flex items-center justify-between border-b border-ink/10 pb-2">
                  <span>Rank & Learner</span>
                  <span>Weekly Momentum</span>
                </div>

                {leaderboard.entries.map((entry) => {
                  const isCurrent = entry.is_current_user;
                  const isPromotion = entry.rank <= leaderboard.promotion_cutoff;
                  const isDemotion = entry.rank >= leaderboard.demotion_cutoff;

                  return (
                    <div
                      key={entry.user_id}
                      className={cn(
                        "flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border-2 transition-all font-display",
                        isCurrent
                          ? "bg-coral-subtle/80 border-coral text-ink shadow-[0_3px_0_0_#D94B3F] ring-2 ring-coral/20"
                          : "bg-cream-tint/40 border-ink/10 text-ink hover:border-ink/30 hover:bg-white"
                      )}
                    >
                      {/* Left: Rank & User Info */}
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-xl font-extrabold text-xs shrink-0 border",
                            entry.rank === 1
                              ? "bg-sun text-ink border-ink"
                              : entry.rank === 2
                              ? "bg-cream-muted text-ink border-ink/30"
                              : entry.rank === 3
                              ? "bg-amber-100 text-amber-900 border-amber-300"
                              : isPromotion
                              ? "bg-mint text-mint-dark border-mint-dark/30"
                              : isDemotion
                              ? "bg-coral-subtle text-coral border-coral/30"
                              : "bg-cream-muted text-ink-subtle border-ink/15"
                          )}
                        >
                          {entry.rank}
                        </span>

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-muted border border-ink/20 font-extrabold text-sm text-ink shrink-0">
                          {entry.name.charAt(0)}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm sm:text-base">
                              {entry.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-coral text-white border border-ink">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-ink-muted">
                            <span className="flex items-center gap-0.5 text-[11px] font-bold">
                              <Flame className="w-3 h-3 text-coral fill-coral" />
                              {entry.current_streak}d streak
                            </span>
                            {isPromotion && (
                              <span className="text-[10px] font-extrabold text-mint-dark flex items-center gap-0.5">
                                <ArrowUp className="w-2.5 h-2.5" /> Promotion
                              </span>
                            )}
                            {isDemotion && (
                              <span className="text-[10px] font-extrabold text-coral flex items-center gap-0.5">
                                <ArrowDown className="w-2.5 h-2.5" /> Demotion
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Weekly XP */}
                      <div className="text-right">
                        <span className="text-base sm:text-lg font-extrabold text-ink">
                          {entry.weekly_xp}
                        </span>
                        <span className="text-xs font-bold text-ink-muted ml-1">
                          XP
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
