"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  getAchievements,
  AchievementsData,
} from "@/lib/api/gamification";
import { getCurrentLearner, LearnerProfile } from "@/lib/api/learner";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonItem } from "@/components/ui/SkeletonLoader";
import {
  Award,
  Sparkles,
  Flame,
  Calendar,
  Zap,
  Shield,
  Crown,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AchievementsPage() {
  const [learner, setLearner] = useState<LearnerProfile | null>(null);
  const [achievementsData, setAchievementsData] =
    useState<AchievementsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const [learnerData, achData] = await Promise.all([
          getCurrentLearner(),
          getAchievements(),
        ]);
        if (!ignore) {
          setLearner(learnerData);
          setAchievementsData(achData);
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load milestone achievements."
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
    Promise.all([getCurrentLearner(), getAchievements()])
      .then(([learnerData, achData]) => {
        setLearner(learnerData);
        setAchievementsData(achData);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load achievements.");
        setIsLoading(false);
      });
  };

  // Icon selector
  const renderIcon = (iconKey: string, isUnlocked: boolean) => {
    const iconClass = cn(
      "w-6 h-6",
      isUnlocked ? "text-sun fill-sun" : "text-ink-subtle"
    );
    switch (iconKey) {
      case "sparkles":
        return <Sparkles className={iconClass} />;
      case "flame":
        return <Flame className={iconClass} />;
      case "calendar":
        return <Calendar className={iconClass} />;
      case "zap":
        return <Zap className={iconClass} />;
      case "shield":
        return <Shield className={iconClass} />;
      case "crown":
        return <Crown className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  const unlockedCount = achievementsData?.unlocked_count || 0;
  const totalCount = achievementsData?.total_achievements || 6;
  const completionPercent = Math.round((unlockedCount / Math.max(1, totalCount)) * 100);

  return (
    <div className="flex min-h-screen flex-col bg-cream selection:bg-mint selection:text-ink font-body">
      {/* Top Navigation */}
      <Navbar learner={learner} onStatsUpdated={handleRetry} />

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-3xl space-y-6">
          {/* Header Banner */}
          <div className="surface-card rounded-3xl p-6 bg-white border-2 border-ink shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sun-subtle border-2 border-sun/50 text-ink text-xs font-extrabold font-display uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5 text-sun fill-sun" />
                  <span>Milestones</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-ink font-display tracking-tight">
                  Learning Achievements
                </h1>
                <p className="text-xs sm:text-sm text-ink-muted font-body">
                  Unlock permanent milestone badges and earn bonus Sparks.
                </p>
              </div>

              {/* Progress Summary Card */}
              <div className="surface-card rounded-2xl p-4 bg-cream-muted/60 border-2 border-ink/15 text-center min-w-[140px] shrink-0">
                <span className="text-xs font-bold font-display text-ink-subtle uppercase">
                  Unlocked
                </span>
                <p className="text-2xl font-extrabold font-display text-ink">
                  {unlockedCount} / {totalCount}
                </p>
              </div>
            </div>

            {/* Overall Progress Meter */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-extrabold font-display text-ink-muted">
                <span>Total Milestone Progress</span>
                <span>{completionPercent}%</span>
              </div>
              <div className="h-3.5 bg-cream-muted rounded-full overflow-hidden border border-ink/15 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-violet to-sun rounded-full transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <SkeletonItem key={idx} className="h-36 rounded-2xl" />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-6">
              <ErrorState
                title="Could not load achievements"
                message={error}
                onRetry={handleRetry}
              />
            </div>
          )}

          {/* Achievements Grid */}
          {!isLoading && achievementsData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievementsData.achievements.map((ach) => {
                return (
                  <div
                    key={ach.id}
                    className={cn(
                      "surface-card rounded-3xl p-5 border-2 transition-all flex flex-col justify-between space-y-4",
                      ach.is_unlocked
                        ? "bg-white border-ink shadow-[0_4px_0_0_#18202A]"
                        : "bg-cream-muted/40 border-ink/15 text-ink/70 opacity-90"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Icon Badge */}
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl border-2 shrink-0 shadow-xs",
                          ach.is_unlocked
                            ? "bg-sun-subtle border-sun text-sun"
                            : "bg-cream-muted border-ink/15 text-ink-subtle"
                        )}
                      >
                        {renderIcon(ach.icon_key, ach.is_unlocked)}
                      </div>

                      {/* Spark Reward Badge */}
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-sun-subtle border border-sun/50 font-display text-xs font-extrabold text-ink">
                        <Sparkles className="w-3.5 h-3.5 text-sun fill-sun" />
                        <span>+{ach.reward_sparks}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold font-display text-ink tracking-tight">
                          {ach.title}
                        </h3>
                        {ach.is_unlocked ? (
                          <CheckCircle2 className="w-4 h-4 text-mint-dark" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-ink-subtle" />
                        )}
                      </div>
                      <p className="text-xs text-ink-muted font-body leading-relaxed">
                        {ach.description}
                      </p>
                    </div>

                    {/* Footer Status */}
                    <div className="pt-2 border-t border-ink/10">
                      {ach.is_unlocked ? (
                        <div className="flex items-center justify-between text-[11px] font-bold font-display text-mint-dark">
                          <span className="uppercase tracking-wider">Unlocked</span>
                          {ach.unlocked_at && (
                            <span className="text-ink-subtle">
                              {new Date(ach.unlocked_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold font-display text-ink-muted">
                            <span>Progress</span>
                            <span>{ach.progress}%</span>
                          </div>
                          <div className="h-2 bg-cream-muted rounded-full overflow-hidden border border-ink/10">
                            <div
                              className="h-full bg-violet rounded-full transition-all duration-300"
                              style={{ width: `${ach.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
