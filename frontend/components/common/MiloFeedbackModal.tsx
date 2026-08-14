"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MiloMascot } from "@/components/branding/MiloMascot";
import { Button } from "@/components/ui/Button";
import {
  Zap,
  Flame,
  Heart,
  Trophy,
  Crown,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type MiloFeedbackModalType =
  | "success"
  | "error"
  | "lesson_complete"
  | "skill_complete";

export interface MiloFeedbackModalProps {
  isOpen: boolean;
  type: MiloFeedbackModalType;
  title?: string;
  subtitle?: string;
  xpGained?: number;
  totalXp?: number;
  streak?: number;
  score?: number;
  heartsRemaining?: number;
  maxHearts?: number;
  correctAnswer?: string | null;
  crownLevel?: number;
  unlockedSkillTitle?: string | null;
  onPrimaryAction: () => void;
  primaryActionLabel?: string;
  isSubmitting?: boolean;
}

// Confetti particle definition for celebrations
const CONFETTI_PARTICLES = [
  { x: -90, y: -80, scale: 0.8, color: "#FFB300", delay: 0.05, rotate: 45 },
  { x: 95, y: -70, scale: 0.9, color: "#A3E635", delay: 0.1, rotate: -30 },
  { x: -110, y: 10, scale: 0.7, color: "#F76F53", delay: 0.15, rotate: 60 },
  { x: 110, y: 20, scale: 0.85, color: "#7E57C2", delay: 0.08, rotate: -45 },
  { x: -60, y: -120, scale: 0.6, color: "#38BDF8", delay: 0.12, rotate: 15 },
  { x: 70, y: -115, scale: 0.75, color: "#FFB300", delay: 0.18, rotate: -60 },
];

export function MiloFeedbackModal({
  isOpen,
  type,
  title,
  subtitle,
  xpGained = 2,
  totalXp,
  streak,
  score,
  heartsRemaining = 5,
  maxHearts = 5,
  correctAnswer,
  crownLevel,
  unlockedSkillTitle,
  onPrimaryAction,
  primaryActionLabel,
  isSubmitting = false,
}: MiloFeedbackModalProps) {
  // Global Enter Key Handler when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !isSubmitting) {
        e.preventDefault();
        onPrimaryAction();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onPrimaryAction]);

  if (!isOpen) return null;

  // Defaults per type
  const isSuccess = type === "success";
  const isError = type === "error";
  const isLessonComplete = type === "lesson_complete";
  const isSkillComplete = type === "skill_complete";

  const resolvedTitle =
    title ||
    (isSuccess
      ? "LOOP CLOSED!"
      : isError
      ? "NOT THIS TIME"
      : isSkillComplete
      ? "SKILL LOOP COMPLETE!"
      : "LESSON COMPLETE!");

  const resolvedSubtitle =
    subtitle ||
    (isSuccess
      ? "Nice work! You're getting better every loop."
      : isError
      ? "Don't worry — mistakes help you learn!"
      : isSkillComplete
      ? "You've mastered this skill and closed the loop!"
      : "Amazing! You've completed this lesson.");

  const resolvedButtonLabel =
    primaryActionLabel ||
    (isSuccess
      ? "Continue"
      : isError
      ? "Try again"
      : isSkillComplete
      ? "Continue to next skill"
      : "Continue the Loop");

  const mascotMood = isError ? "encouraging" : "celebrating";

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={resolvedTitle}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none overflow-y-auto"
        >
          {/* 1. Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-ink/50 backdrop-blur-sm"
          />

          {/* 2. Centered Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
            className={cn(
              "surface-card relative z-10 w-full max-w-[460px] rounded-3xl p-6 sm:p-8 bg-white border-3 border-ink shadow-[0_12px_0_0_#18202A] text-center overflow-hidden",
              isError
                ? "ring-4 ring-coral/20"
                : isSkillComplete
                ? "ring-4 ring-sun/30"
                : "ring-4 ring-mint/30"
            )}
          >
            {/* Radial Glow Background Behind Milo */}
            <div
              className={cn(
                "absolute top-6 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-2xl pointer-events-none opacity-50",
                isError
                  ? "bg-coral/30"
                  : isSkillComplete
                  ? "bg-sun/40"
                  : "bg-mint/40"
              )}
            />

            {/* Confetti Particles (Success / Complete Only) */}
            {!isError && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {CONFETTI_PARTICLES.map((p, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{
                      opacity: [0, 1, 0.9, 0],
                      scale: [0, p.scale, p.scale * 1.1, 0],
                      x: p.x,
                      y: p.y,
                      rotate: p.rotate,
                    }}
                    transition={{
                      duration: 1.6,
                      delay: p.delay,
                      ease: "easeOut",
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                    className="absolute top-24 left-1/2 w-3 h-3 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                ))}
              </div>
            )}

            {/* Milo Mascot */}
            <div className="relative flex justify-center py-2">
              <motion.div
                initial={{ scale: 0.85, y: 8 }}
                animate={{ scale: 1, y: 0 }}
                transition={{
                  type: "spring",
                  damping: 15,
                  stiffness: 280,
                  delay: 0.05,
                }}
              >
                <MiloMascot
                  size={isLessonComplete || isSkillComplete ? "lg" : "md"}
                  mood={mascotMood}
                  className={cn(
                    "drop-shadow-lg",
                    isLessonComplete || isSkillComplete
                      ? "!w-36 !h-36 sm:!w-44 sm:!h-44"
                      : "!w-32 !h-32 sm:!w-36 sm:!h-36"
                  )}
                />
              </motion.div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1 mt-2">
              <h2
                className={cn(
                  "text-2xl sm:text-3xl font-extrabold font-display tracking-tight leading-tight",
                  isError
                    ? "text-coral"
                    : isSkillComplete
                    ? "text-ink"
                    : isSuccess
                    ? "text-mint-dark"
                    : "text-ink"
                )}
              >
                {resolvedTitle}
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted font-body leading-relaxed max-w-sm mx-auto">
                {resolvedSubtitle}
              </p>
            </div>

            {/* 1. Success Answer Details */}
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-4 space-y-3"
              >
                {/* XP Reward Badge */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-violet-subtle border border-violet/30 text-violet font-extrabold font-display text-xs shadow-2xs">
                  <Zap className="w-4 h-4 fill-violet" />
                  <span>+{xpGained} Momentum XP</span>
                </div>

                {/* Quick Stats Strip */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="rounded-xl p-2.5 bg-cream border border-ink/10 text-center">
                    <span className="text-[10px] font-bold font-display text-ink-subtle uppercase">
                      {totalXp !== undefined ? "Total XP" : "XP Gained"}
                    </span>
                    <p className="text-sm font-extrabold font-display text-violet">
                      {totalXp !== undefined ? `${totalXp} XP` : `+${xpGained}`}
                    </p>
                  </div>

                  <div className="rounded-xl p-2.5 bg-cream border border-ink/10 text-center">
                    <span className="text-[10px] font-bold font-display text-ink-subtle uppercase">
                      Streak
                    </span>
                    <p className="text-sm font-extrabold font-display text-coral flex items-center justify-center gap-0.5">
                      <Flame className="w-3.5 h-3.5 fill-coral" />
                      {streak ?? 1}d
                    </p>
                  </div>

                  <div className="rounded-xl p-2.5 bg-cream border border-ink/10 text-center">
                    <span className="text-[10px] font-bold font-display text-ink-subtle uppercase">
                      Hearts
                    </span>
                    <p className="text-sm font-extrabold font-display text-ink flex items-center justify-center gap-0.5">
                      <Heart className="w-3.5 h-3.5 text-coral fill-coral" />
                      {heartsRemaining}/{maxHearts}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. Error Answer Details */}
            {isError && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-4 space-y-3"
              >
                {/* Heart Loss Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral-subtle border border-coral/40 text-coral font-extrabold font-display text-xs">
                  <Heart className="w-3.5 h-3.5 fill-coral" />
                  <span>-1 Heart ({heartsRemaining} remaining)</span>
                </div>

                {/* Correct Answer Highlight Box */}
                {correctAnswer && (
                  <div className="bg-coral-subtle/50 border-2 border-coral/30 rounded-2xl p-3.5 text-left space-y-1 shadow-2xs">
                    <p className="text-[10px] font-bold font-display text-coral uppercase tracking-wider">
                      Correct answer:
                    </p>
                    <p className="text-sm sm:text-base font-extrabold font-display text-ink">
                      {correctAnswer}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* 3. Lesson Complete Details */}
            {isLessonComplete && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-4 space-y-3"
              >
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl p-3 bg-violet-subtle border border-violet/30 text-center space-y-0.5">
                    <Zap className="w-4 h-4 text-violet fill-violet mx-auto" />
                    <span className="text-[10px] font-bold font-display text-ink-subtle uppercase">
                      Total XP
                    </span>
                    <p className="text-base font-extrabold font-display text-violet">
                      +{xpGained}
                    </p>
                  </div>

                  <div className="rounded-xl p-3 bg-aqua-subtle border border-aqua/30 text-center space-y-0.5">
                    <Trophy className="w-4 h-4 text-aqua mx-auto" />
                    <span className="text-[10px] font-bold font-display text-ink-subtle uppercase">
                      Accuracy
                    </span>
                    <p className="text-base font-extrabold font-display text-ink">
                      {score ?? 100}%
                    </p>
                  </div>

                  <div className="rounded-xl p-3 bg-coral-subtle border border-coral/30 text-center space-y-0.5">
                    <Flame className="w-4 h-4 text-coral fill-coral mx-auto" />
                    <span className="text-[10px] font-bold font-display text-ink-subtle uppercase">
                      Streak
                    </span>
                    <p className="text-base font-extrabold font-display text-coral">
                      {streak ?? 1}d
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. Skill Complete Details */}
            {isSkillComplete && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-4 space-y-3"
              >
                {/* Crown Mastery Banner */}
                <div className="rounded-2xl p-3.5 bg-sun-subtle border-2 border-sun/60 text-ink space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold font-display uppercase tracking-wider text-ink">
                    <Crown className="w-4 h-4 text-sun fill-sun" />
                    <span>Island Mastery Level {crownLevel || 1} Earned!</span>
                  </div>
                  {unlockedSkillTitle && (
                    <p className="text-xs font-bold text-ink-muted">
                      Next Island Unlocked:{" "}
                      <span className="text-ink font-extrabold">
                        {unlockedSkillTitle}
                      </span>
                    </p>
                  )}
                </div>

                {/* XP Reward & Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl p-2.5 bg-violet-subtle border border-violet/30 text-center">
                    <span className="text-[10px] font-bold font-display text-ink-subtle uppercase">
                      XP Awarded
                    </span>
                    <p className="text-sm font-extrabold font-display text-violet">
                      +{xpGained} XP
                    </p>
                  </div>

                  <div className="rounded-xl p-2.5 bg-sun-subtle border border-sun/40 text-center">
                    <span className="text-[10px] font-bold font-display text-ink-subtle uppercase">
                      Crown Level
                    </span>
                    <p className="text-sm font-extrabold font-display text-sun-dark flex items-center justify-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 fill-sun" />
                      Level {crownLevel || 1}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Primary Action Button */}
            <div className="mt-6">
              <Button
                variant={isError ? "coral" : isSuccess ? "mint" : "coral"}
                size="lg"
                onClick={onPrimaryAction}
                disabled={isSubmitting}
                className={cn(
                  "w-full shadow-[0_5px_0_0_#18202A] text-sm sm:text-base font-extrabold font-display cursor-pointer",
                  isSkillComplete ? "bg-sun text-ink hover:bg-sun-dark" : ""
                )}
              >
                <span>{resolvedButtonLabel}</span>
                <ArrowRight className="w-4 h-4 ml-2 stroke-[3]" />
              </Button>

              <p className="text-[11px] text-ink-subtle mt-2 font-display">
                Press{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-cream-muted border border-ink/15 font-mono text-[10px]">
                  Enter ↵
                </kbd>{" "}
                to continue
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
