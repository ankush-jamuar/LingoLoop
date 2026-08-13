"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Flame, Trophy, Crown, ArrowRight, CheckCircle } from "lucide-react";
import { LessonCompletionResult } from "@/lib/api/lesson";
import { MiloMascot } from "@/components/branding/MiloMascot";
import { Button } from "@/components/ui/Button";

interface LessonCompleteScreenProps {
  result: LessonCompletionResult;
  onContinue: () => void;
}

export function LessonCompleteScreen({
  result,
  onContinue,
}: LessonCompleteScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-xl mx-auto w-full text-center space-y-6 select-none animate-fade-in">
      {/* Milo Mascot Celebrating */}
      <motion.div
        initial={{ scale: 0.8, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <MiloMascot size="lg" mood="celebrating" />
      </motion.div>

      {/* Main Heading */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint border border-mint-dark/30 text-mint-dark text-xs font-extrabold font-display uppercase tracking-wider">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{result.is_replay ? "Loop Practiced" : "Loop Closed"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink font-display tracking-tight">
          LOOP COMPLETE!
        </h1>
        <p className="text-sm sm:text-base text-ink-muted font-body">
          {result.is_replay
            ? "Great practice session! Reinforcing your memory compounds mastery."
            : "Your recall is getting stronger with every completed loop."}
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-3 gap-3 w-full pt-2">
        {/* Momentum XP Awarded */}
        <div className="surface-card rounded-2xl p-4 bg-white border-2 border-violet/30 text-center space-y-1 shadow-sm">
          <div className="flex justify-center text-violet">
            <Zap className="w-5 h-5 fill-violet" />
          </div>
          <span className="text-xs font-bold font-display text-ink-subtle uppercase">
            Total XP
          </span>
          <p className="text-xl sm:text-2xl font-extrabold font-display text-violet">
            +{result.total_xp_awarded}
          </p>
        </div>

        {/* Score / Accuracy */}
        <div className="surface-card rounded-2xl p-4 bg-white border-2 border-aqua/30 text-center space-y-1 shadow-sm">
          <div className="flex justify-center text-aqua">
            <Trophy className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold font-display text-ink-subtle uppercase">
            Accuracy
          </span>
          <p className="text-xl sm:text-2xl font-extrabold font-display text-ink">
            {result.score}%
          </p>
        </div>

        {/* Streak */}
        <div className="surface-card rounded-2xl p-4 bg-white border-2 border-coral/30 text-center space-y-1 shadow-sm">
          <div className="flex justify-center text-coral">
            <Flame className="w-5 h-5 fill-coral" />
          </div>
          <span className="text-xs font-bold font-display text-ink-subtle uppercase">
            Streak
          </span>
          <p className="text-xl sm:text-2xl font-extrabold font-display text-coral">
            {result.current_streak}d
          </p>
        </div>
      </div>

      {/* Skill Progression & Unlocking Banner */}
      {result.skill_completed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="surface-card rounded-2xl p-4 bg-sun-subtle border-2 border-sun/60 text-ink space-y-1 w-full text-center"
        >
          <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold font-display uppercase tracking-wider text-ink">
            <Crown className="w-4 h-4 text-sun fill-sun" />
            <span>Island Mastery Level {result.crown_level} Earned!</span>
          </div>
          {result.unlocked_skill_title && (
            <p className="text-xs sm:text-sm font-bold text-ink-muted">
              Next Island Unlocked: <span className="text-ink font-extrabold">{result.unlocked_skill_title}</span>
            </p>
          )}
        </motion.div>
      )}

      {/* Primary Continue CTA Button */}
      <div className="w-full pt-4">
        <Button
          variant="coral"
          size="lg"
          onClick={onContinue}
          className="w-full shadow-[0_5px_0_0_#18202A]"
        >
          <span>Continue the Loop</span>
          <ArrowRight className="w-5 h-5 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}
