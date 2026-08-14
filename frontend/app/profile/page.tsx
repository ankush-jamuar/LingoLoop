"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MiloMascot } from "@/components/branding/MiloMascot";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonItem } from "@/components/ui/SkeletonLoader";
import { getCurrentLearner, LearnerProfile } from "@/lib/api/learner";
import { getAchievements, AchievementsData, getLeaderboard, LeaderboardData } from "@/lib/api/gamification";
import { getActiveCourse, getLoopMap, LoopMap } from "@/lib/api/course";
import {
  Flame,
  Zap,
  Heart,
  Sparkles,
  Trophy,
  Award,
  Crown,
  Target,
  Settings,
  ArrowRight,
  Shield,
  BookOpen,
} from "lucide-react";

export default function ProfilePage() {
  const [learner, setLearner] = useState<LearnerProfile | null>(null);
  const [achievements, setAchievements] = useState<AchievementsData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [loopMap, setLoopMap] = useState<LoopMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [learnerData, achData, leadData, courseData] = await Promise.all([
        getCurrentLearner(),
        getAchievements(),
        getLeaderboard(),
        getActiveCourse(),
      ]);

      setLearner(learnerData);
      setAchievements(achData);
      setLeaderboard(leadData);

      if (courseData?.id) {
        const mapData = await getLoopMap(courseData.id);
        setLoopMap(mapData);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load learner profile."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      try {
        const [learnerData, achData, leadData, courseData] = await Promise.all([
          getCurrentLearner(),
          getAchievements(),
          getLeaderboard(),
          getActiveCourse(),
        ]);

        if (!ignore) {
          setLearner(learnerData);
          setAchievements(achData);
          setLeaderboard(leadData);

          if (courseData?.id) {
            const mapData = await getLoopMap(courseData.id);
            if (!ignore) {
              setLoopMap(mapData);
            }
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Failed to load learner profile."
          );
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, []);

  // Compute aggregate statistics across curriculum
  const statsOverview = useMemo(() => {
    if (!loopMap) {
      return { totalSkills: 9, completedSkills: 0, totalLessons: 18, completedLessons: 0, totalCrowns: 0 };
    }
    let totalSkills = 0;
    let completedSkills = 0;
    let totalLessons = 0;
    let completedLessons = 0;
    let totalCrowns = 0;

    for (const unit of loopMap.units) {
      for (const skill of unit.skills) {
        totalSkills += 1;
        totalLessons += skill.total_lessons;
        completedLessons += skill.lessons_completed;
        totalCrowns += skill.crown_level;
        if (skill.completed || skill.status === "completed") {
          completedSkills += 1;
        }
      }
    }

    return { totalSkills, completedSkills, totalLessons, completedLessons, totalCrowns };
  }, [loopMap]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col justify-between font-body">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
          <div className="surface-card rounded-3xl p-6 bg-white border-2 border-ink/15 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <SkeletonItem className="w-20 h-20 rounded-full" />
              <div className="space-y-2 flex-1">
                <SkeletonItem className="h-6 w-48 rounded-md" />
                <SkeletonItem className="h-4 w-32 rounded-md" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonItem key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !learner) {
    return (
      <div className="min-h-screen bg-cream flex flex-col justify-between font-body">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <ErrorState
            title="Profile Unavailable"
            message={error || "Could not load learner profile."}
            onRetry={loadData}
          />
        </main>
        <Footer />
      </div>
    );
  }

  const dailyGoalXP = learner.stats.daily_goal_xp || 30;
  const todayXP = Math.min(learner.stats.total_xp, dailyGoalXP);
  const goalProgressPercent = Math.min(100, Math.round((todayXP / dailyGoalXP) * 100));

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-between selection:bg-mint selection:text-ink font-body">
      <Navbar learner={learner} onStatsUpdated={loadData} />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Top Learner Identity Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="surface-card relative rounded-3xl p-6 sm:p-8 bg-white border-2 border-ink shadow-[0_6px_0_0_#18202A] flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar Mascot Emblem */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-sun-subtle border-3 border-ink flex items-center justify-center shadow-xs">
                <MiloMascot size="xs" mood="cheerful" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-mint-dark text-white rounded-full p-1 border-2 border-white shadow-xs">
                <Shield className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-ink tracking-tight">
                  {learner.name}
                </h1>
                <Badge variant="mint" size="sm">
                  Active Learner
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted font-body">
                {learner.email}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-xs font-bold font-display text-ink-subtle">
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-sun fill-sun" />
                  {leaderboard?.tier_name || "Silver Loop League"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-violet" />
                  Spanish Course
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/settings">
              <Button
                variant="outline"
                size="md"
                className="bg-white hover:bg-cream-muted text-ink border-2 border-ink shadow-[0_3px_0_0_#18202A] cursor-pointer"
              >
                <Settings className="w-4 h-4 mr-1.5" />
                <span>Settings</span>
              </Button>
            </Link>
            <Link href="/learn">
              <Button
                variant="coral"
                size="md"
                className="shadow-[0_3px_0_0_#18202A] cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* 6 Key Lifetime Stats Grid */}
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold font-display text-ink tracking-tight">
            Lifetime Statistics
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Total XP */}
            <div className="surface-card rounded-2xl p-4 sm:p-5 bg-white border-2 border-ink/20 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-display text-ink-muted uppercase tracking-wider">
                  Total XP
                </span>
                <Zap className="w-4 h-4 text-violet fill-violet" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-ink">
                {learner.stats.total_xp}
              </p>
              <p className="text-[11px] text-ink-subtle">Momentum earned</p>
            </div>

            {/* Current Streak */}
            <div className="surface-card rounded-2xl p-4 sm:p-5 bg-white border-2 border-ink/20 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-display text-ink-muted uppercase tracking-wider">
                  Current Streak
                </span>
                <Flame className="w-4 h-4 text-coral fill-coral" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-coral">
                {learner.stats.current_streak} {learner.stats.current_streak === 1 ? "day" : "days"}
              </p>
              <p className="text-[11px] text-ink-subtle">
                Best: {learner.stats.longest_streak} days
              </p>
            </div>

            {/* Hearts Balance */}
            <div className="surface-card rounded-2xl p-4 sm:p-5 bg-white border-2 border-ink/20 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-display text-ink-muted uppercase tracking-wider">
                  Hearts
                </span>
                <Heart className="w-4 h-4 text-coral fill-coral" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-ink">
                {learner.stats.hearts}
                <span className="text-base text-ink-subtle font-bold">/{learner.stats.max_hearts}</span>
              </p>
              <p className="text-[11px] text-ink-subtle">Mistake stamina</p>
            </div>

            {/* Sparks Gems */}
            <div className="surface-card rounded-2xl p-4 sm:p-5 bg-white border-2 border-ink/20 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-display text-ink-muted uppercase tracking-wider">
                  Sparks
                </span>
                <Sparkles className="w-4 h-4 text-sun fill-sun" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-sun-dark">
                {learner.stats.gems}
              </p>
              <p className="text-[11px] text-ink-subtle">Shop currency</p>
            </div>

            {/* Completed Loops */}
            <div className="surface-card rounded-2xl p-4 sm:p-5 bg-white border-2 border-ink/20 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-display text-ink-muted uppercase tracking-wider">
                  Mastered Skills
                </span>
                <Crown className="w-4 h-4 text-sun fill-sun" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-ink">
                {statsOverview.completedSkills}
                <span className="text-base text-ink-subtle font-bold">/{statsOverview.totalSkills}</span>
              </p>
              <p className="text-[11px] text-ink-subtle">Crowns earned: {statsOverview.totalCrowns}</p>
            </div>

            {/* Completed Lessons */}
            <div className="surface-card rounded-2xl p-4 sm:p-5 bg-white border-2 border-ink/20 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-display text-ink-muted uppercase tracking-wider">
                  Completed Lessons
                </span>
                <Award className="w-4 h-4 text-mint-dark" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-ink">
                {statsOverview.completedLessons}
                <span className="text-base text-ink-subtle font-bold">/{statsOverview.totalLessons}</span>
              </p>
              <p className="text-[11px] text-ink-subtle">Closed learning loops</p>
            </div>
          </div>
        </section>

        {/* Daily Goal & League Standing Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily XP Goal */}
          <div className="surface-card rounded-3xl p-6 bg-white border-2 border-ink shadow-[0_4px_0_0_#18202A] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-violet-subtle border border-violet/30 text-violet">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold font-display text-ink">
                    Daily Goal
                  </h3>
                  <p className="text-xs text-ink-muted">
                    {dailyGoalXP} XP daily target
                  </p>
                </div>
              </div>

              <Badge variant={goalProgressPercent >= 100 ? "mint" : "sun"} size="sm">
                {goalProgressPercent >= 100 ? "Goal Met!" : `${todayXP}/${dailyGoalXP} XP`}
              </Badge>
            </div>

            {/* Goal Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded-full bg-cream-muted border border-ink/20 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goalProgressPercent}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    goalProgressPercent >= 100 ? "bg-mint-dark" : "bg-violet"
                  }`}
                />
              </div>
              <p className="text-[11px] text-ink-subtle text-right font-display font-bold">
                {goalProgressPercent}% completed today
              </p>
            </div>
          </div>

          {/* Momentum League Ranking */}
          <div className="surface-card rounded-3xl p-6 bg-white border-2 border-ink shadow-[0_4px_0_0_#18202A] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sun-subtle border border-sun/40 text-sun">
                  <Trophy className="w-4 h-4 fill-sun" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold font-display text-ink">
                    {leaderboard?.tier_name || "Silver Loop"} League
                  </h3>
                  <p className="text-xs text-ink-muted">
                    Weekly Cohort Standings
                  </p>
                </div>
              </div>

              <Link href="/leaderboard">
                <Button variant="ghost" size="sm" className="text-xs text-violet font-bold">
                  <span>View League</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-ink/10">
              <span className="text-xs font-bold font-display text-ink-muted">
                Your Weekly Rank
              </span>
              <span className="text-sm font-extrabold font-display text-ink">
                #{leaderboard?.user_rank ?? 6} • {leaderboard?.user_weekly_xp ?? 0} Weekly XP
              </span>
            </div>
          </div>
        </div>

        {/* Milestones / Achievements Section */}
        {achievements && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold font-display text-ink tracking-tight">
                Milestone Achievements ({achievements.unlocked_count}/{achievements.total_achievements})
              </h2>
              <Link href="/achievements">
                <Button variant="ghost" size="sm" className="text-xs text-violet font-bold">
                  <span>See all milestones</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.achievements.slice(0, 4).map((ach) => (
                <div
                  key={ach.id}
                  className={`surface-card rounded-2xl p-4 border-2 transition-all ${
                    ach.is_unlocked
                      ? "bg-white border-ink shadow-xs"
                      : "bg-cream-muted/50 border-ink/15 opacity-75"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center shrink-0 ${
                        ach.is_unlocked
                          ? "bg-sun-subtle border-sun text-sun"
                          : "bg-cream-muted border-ink/20 text-ink-subtle"
                      }`}
                    >
                      <Award className={`w-5 h-5 ${ach.is_unlocked ? "fill-sun" : ""}`} />
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-extrabold font-display text-ink leading-tight">
                          {ach.title}
                        </h4>
                        <span className="text-xs font-bold font-display text-sun-dark">
                          +{ach.reward_sparks} Sparks
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted leading-relaxed font-body">
                        {ach.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
