"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/branding/Logo";
import { resetDevProgress } from "@/lib/api/dev";
import { RotateCcw, Check } from "lucide-react";

export function Footer() {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleDevReset = async () => {
    if (isResetting) return;
    setIsResetting(true);
    try {
      await resetDevProgress();
      if (typeof window !== "undefined") {
        window.localStorage.clear();
        window.sessionStorage.clear();
      }
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        router.push("/");
        router.refresh();
      }, 600);
    } catch (err) {
      console.error("Failed to reset progress:", err);
      setIsResetting(false);
    }
  };

  return (
    <footer className="w-full border-t border-ink/10 bg-cream-muted/50 py-10 select-none">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center sm:items-start gap-2">
          <Logo size="sm" />
          <p className="text-xs text-ink-muted">
            Learn. Loop. Level up. — An original language-learning experience.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Dev-Only Evaluator Reset Trigger */}
          <button
            onClick={handleDevReset}
            disabled={isResetting}
            title="Development-only: Reset learner state to fresh unstarted baseline"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-ink/20 bg-white hover:bg-cream-muted text-[11px] font-bold font-display text-ink-muted hover:text-ink transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            {resetSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-mint-dark" />
                <span className="text-mint-dark font-bold">Fresh State Restored!</span>
              </>
            ) : isResetting ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin text-coral" />
                <span>Resetting...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5 text-ink-subtle" />
                <span>Reset Seed Data (Dev)</span>
              </>
            )}
          </button>

          <div className="flex flex-col items-center sm:items-end gap-1 text-xs text-ink-subtle">
            <span className="font-display font-semibold">
              Learn → Practice → Recall → Earn → Repeat
            </span>
            <span className="text-[11px]">Evaluation & Testing Mode</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
