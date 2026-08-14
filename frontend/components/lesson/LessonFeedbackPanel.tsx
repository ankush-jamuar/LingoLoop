"use client";

import React, { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LessonFeedbackPanelProps {
  status: "idle" | "submitting" | "correct" | "wrong";
  canSubmit: boolean;
  onSubmit: () => void;
}

export function LessonFeedbackPanel({
  status,
  canSubmit,
  onSubmit,
}: LessonFeedbackPanelProps) {
  // Global Enter Key Handler for Check Answer when idle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (status === "idle" && canSubmit) {
          e.preventDefault();
          onSubmit();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, canSubmit, onSubmit]);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t-2 border-ink/10 select-none">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 sm:px-6 py-4 sm:py-5 min-h-[84px] sm:min-h-[96px]">
        {/* Left Tip */}
        <div className="flex items-center gap-2 text-xs font-semibold text-ink-subtle">
          <span className="hidden sm:inline">
            Press{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-cream-muted border border-ink/15 font-mono text-[11px]">
              Enter ↵
            </kbd>{" "}
            to check
          </span>
        </div>

        {/* Right Action Button */}
        <div className="flex items-center justify-end w-full sm:w-auto">
          <Button
            variant="coral"
            size="lg"
            disabled={!canSubmit || status === "submitting"}
            onClick={onSubmit}
            className="w-full sm:w-auto min-w-[150px] sm:min-w-[180px] shadow-[0_4px_0_0_#18202A] cursor-pointer"
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
        </div>
      </div>
    </footer>
  );
}
