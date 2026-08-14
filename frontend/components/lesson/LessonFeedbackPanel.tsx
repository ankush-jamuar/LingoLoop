"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MiloMascot } from "@/components/branding/MiloMascot";
import { cn } from "@/lib/utils";

interface LessonFeedbackPanelProps {
  status: "idle" | "submitting" | "correct" | "wrong";
  canSubmit: boolean;
  xpEarned?: number;
  correctAnswerDisplay?: string | null;
  onSubmit: () => void;
  onContinue: () => void;
}

export function LessonFeedbackPanel({
  status,
  canSubmit,
  xpEarned = 2,
  correctAnswerDisplay,
  onSubmit,
  onContinue,
}: LessonFeedbackPanelProps) {
  // Global Enter Key Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (status === "idle" && canSubmit) {
          onSubmit();
        } else if (status === "correct" || status === "wrong") {
          onContinue();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, canSubmit, onSubmit, onContinue]);

  const isFeedback = status === "correct" || status === "wrong";

  return (
    <footer
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 transition-colors duration-250 border-t-2 select-none",
        status === "idle" || status === "submitting"
          ? "bg-white/95 backdrop-blur-md border-ink/10"
          : status === "correct"
          ? "bg-mint border-mint-dark text-ink"
          : "bg-coral-subtle border-coral text-ink"
      )}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 sm:px-6 py-4 sm:py-5 min-h-[84px] sm:min-h-[96px]">
        {/* Left Feedback Message */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          {status === "correct" && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <MiloMascot size="xs" mood="celebrating" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-base sm:text-lg font-extrabold font-display text-mint-dark tracking-tight leading-none">
                    LOOP CLOSED!
                  </h4>
                  <span className="hidden sm:inline-block text-[11px] font-bold text-mint-dark bg-white px-2 py-0.5 rounded-full border border-mint-dark/30">
                    Nice work!
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold font-display text-violet">
                  <Zap className="w-3.5 h-3.5 fill-violet" />
                  <span>+{xpEarned} Momentum XP</span>
                </div>
              </div>
            </motion.div>
          )}

          {status === "wrong" && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <MiloMascot size="xs" mood="encouraging" />
              <div className="space-y-0.5 max-w-md">
                <div className="flex items-center gap-2">
                  <h4 className="text-base sm:text-lg font-extrabold font-display text-coral tracking-tight leading-none">
                    NOT THIS TIME
                  </h4>
                  <span className="text-[11px] font-bold text-coral bg-white px-2 py-0.5 rounded-full border border-coral/30">
                    -1 Heart
                  </span>
                </div>
                {correctAnswerDisplay && (
                  <p className="text-xs sm:text-sm text-ink-muted font-body">
                    Correct answer:{" "}
                    <span className="font-bold text-ink underline decoration-coral/40">
                      {correctAnswerDisplay}
                    </span>
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {!isFeedback && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-ink-subtle">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-cream-muted border border-ink/15 font-mono text-[11px]">Enter ↵</kbd> to check</span>
            </div>
          )}
        </div>

        {/* Right Action Button */}
        <div className="flex items-center justify-end">
          {status === "idle" || status === "submitting" ? (
            <Button
              variant="coral"
              size="lg"
              disabled={!canSubmit || status === "submitting"}
              onClick={onSubmit}
              className="min-w-[140px] sm:min-w-[170px]"
            >
              {status === "submitting" ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <span>Check Answer</span>
              )}
            </Button>
          ) : (
            <Button
              variant={status === "correct" ? "mint" : "coral"}
              size="lg"
              onClick={onContinue}
              className="min-w-[140px] sm:min-w-[170px]"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
}
