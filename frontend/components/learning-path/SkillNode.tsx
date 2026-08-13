"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Smile,
  MessageCircle,
  Utensils,
  Box,
  MapPin,
  Sun,
  Calendar,
  Users,
  Lock,
  Crown,
  Check,
  Zap,
} from "lucide-react";
import { SkillMapNode } from "@/lib/api/course";
import { cn } from "@/lib/utils";

interface SkillNodeProps {
  skill: SkillMapNode;
  horizontalOffset?: "left" | "center" | "right";
  onClick: (skill: SkillMapNode) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  sparkles: Sparkles,
  smile: Smile,
  "message-circle": MessageCircle,
  utensils: Utensils,
  box: Box,
  "map-pin": MapPin,
  sun: Sun,
  calendar: Calendar,
  users: Users,
};

export function SkillNode({
  skill,
  horizontalOffset = "center",
  onClick,
}: SkillNodeProps) {
  const Icon = ICON_MAP[skill.icon_key] || Sparkles;

  const isCompleted = skill.status === "completed" || skill.completed;
  const isInProgress = skill.status === "in_progress";
  const isLocked = !skill.is_unlocked || skill.status === "locked";
  const isUnlocked = skill.is_unlocked && !isCompleted && !isInProgress;

  const offsetStyles = {
    left: "sm:-translate-x-12",
    center: "translate-x-0",
    right: "sm:translate-x-12",
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center transition-transform duration-300",
        offsetStyles[horizontalOffset]
      )}
    >
      {/* Active Loop Pulse Ring for In-Progress Skill */}
      {isInProgress && (
        <span className="absolute -inset-2.5 rounded-full bg-coral/25 animate-ping pointer-events-none" />
      )}

      {/* Main Node Button */}
      <motion.button
        whileHover={!isLocked ? { scale: 1.05, y: -3 } : {}}
        whileTap={!isLocked ? { scale: 0.95, y: 1 } : {}}
        disabled={isLocked}
        onClick={() => onClick(skill)}
        aria-label={`${skill.title} - ${skill.status}`}
        className={cn(
          "relative flex items-center justify-center rounded-full transition-all select-none cursor-pointer focus:outline-none",
          // Node Dimensions & 3D Tactile Layering
          "w-20 h-20 sm:w-24 sm:h-24 border-3",
          // Completed State
          isCompleted &&
            "bg-mint/40 border-mint-dark text-mint-dark shadow-[0_5px_0_0_#227B53] hover:bg-mint/70",
          // In Progress State
          isInProgress &&
            "bg-white border-coral text-coral shadow-[0_5px_0_0_#D94B3F] ring-4 ring-coral/20",
          // Unlocked Ready State
          isUnlocked &&
            "bg-white border-ink text-ink shadow-[0_5px_0_0_#18202A] hover:bg-cream-tint",
          // Locked State
          isLocked &&
            "bg-cream-muted/70 border-ink/20 text-ink-subtle shadow-[0_3px_0_0_#D8CBB9] cursor-not-allowed opacity-75"
        )}
      >
        {/* Node Icon */}
        {isLocked ? (
          <Lock className="w-7 h-7 text-ink-subtle" />
        ) : (
          <Icon
            className={cn(
              "w-8 h-8 sm:w-9 sm:h-9 transition-transform",
              isCompleted && "text-mint-dark",
              isInProgress && "text-coral animate-bounce-subtle",
              isUnlocked && "text-ink"
            )}
          />
        )}

        {/* Crown Badge for Completed / Mastered Skill */}
        {isCompleted && skill.crown_level > 0 && (
          <div
            title={`Crown Level ${skill.crown_level}`}
            className="absolute -top-2 -right-1.5 flex items-center gap-0.5 rounded-full bg-sun border-2 border-ink px-1.5 py-0.5 shadow-xs"
          >
            <Crown className="w-3.5 h-3.5 text-ink fill-ink" />
            <span className="text-[10px] font-extrabold text-ink font-display leading-none">
              {skill.crown_level}
            </span>
          </div>
        )}

        {/* Checkmark Badge for Completed Skill */}
        {isCompleted && (
          <div className="absolute -bottom-1 -left-1 flex items-center justify-center w-6 h-6 rounded-full bg-mint-dark text-white border-2 border-white shadow-xs">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        )}

        {/* Progress Fraction Pill for In-Progress Skill */}
        {isInProgress && (
          <div className="absolute -bottom-2 bg-coral text-white text-[10px] font-extrabold font-display px-2 py-0.5 rounded-full border border-ink shadow-xs">
            {skill.lessons_completed}/{skill.total_lessons}
          </div>
        )}
      </motion.button>

      {/* Label and Subtitle */}
      <div className="mt-3 flex flex-col items-center text-center max-w-[140px]">
        <span
          className={cn(
            "text-xs sm:text-sm font-extrabold font-display tracking-tight leading-tight",
            isLocked ? "text-ink-subtle" : "text-ink"
          )}
        >
          {skill.title}
        </span>
        {skill.subtitle && !isLocked && (
          <span className="text-[10px] text-ink-muted font-body leading-tight mt-0.5 line-clamp-1">
            {skill.subtitle}
          </span>
        )}
        {isInProgress && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold font-display text-coral mt-0.5 uppercase tracking-wider">
            <Zap className="w-2.5 h-2.5 fill-coral" />
            Current Loop
          </span>
        )}
      </div>
    </div>
  );
}
