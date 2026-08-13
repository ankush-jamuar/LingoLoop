"use client";

import React from "react";
import { X, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LessonHeaderProps {
  progressPercentage: number;
  heartsRemaining: number;
  maxHearts?: number;
  onExitClick: () => void;
  isHeartLostAnimation?: boolean;
}

export function LessonHeader({
  progressPercentage,
  heartsRemaining,
  onExitClick,
  isHeartLostAnimation = false,
}: LessonHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-cream/95 backdrop-blur-md border-b border-ink/10 select-none">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 sm:px-6 h-16 sm:h-20">
        {/* Exit Button */}
        <button
          onClick={onExitClick}
          className="rounded-full p-2 text-ink-muted hover:text-ink hover:bg-cream-muted transition-colors cursor-pointer"
          aria-label="Quit lesson"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Center Progress Bar */}
        <div className="flex-1 max-w-md h-3.5 sm:h-4 bg-cream-muted rounded-full overflow-hidden border border-ink/15 shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-violet to-aqua rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>

        {/* Hearts Indicator */}
        <motion.div
          animate={
            isHeartLostAnimation
              ? { scale: [1, 1.3, 0.9, 1], rotate: [0, -10, 10, 0] }
              : {}
          }
          transition={{ duration: 0.4 }}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1 font-display select-none transition-colors",
            heartsRemaining > 1
              ? "bg-coral-subtle/80 border-coral/30 text-coral"
              : heartsRemaining === 1
              ? "bg-coral text-white border-ink shadow-xs animate-pulse"
              : "bg-ink/10 border-ink/20 text-ink-subtle"
          )}
        >
          <Heart
            className={cn(
              "w-4 h-4",
              heartsRemaining > 0 ? "fill-coral text-coral" : "text-ink-subtle",
              heartsRemaining === 1 && "fill-white text-white"
            )}
          />
          <span className="text-xs sm:text-sm font-extrabold leading-none">
            {heartsRemaining}
          </span>
        </motion.div>
      </div>
    </header>
  );
}
