"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Heart,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  buyStreakFreeze,
  getHeartStatus,
  HeartStatus,
  refillHearts,
} from "@/lib/api/gamification";
import { cn } from "@/lib/utils";

interface SparksShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatsUpdated?: () => void;
}

export function SparksShopModal({
  isOpen,
  onClose,
  onStatsUpdated,
}: SparksShopModalProps) {
  const [heartStatus, setHeartStatus] = useState<HeartStatus | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getHeartStatus();
      setHeartStatus(data);
    } catch {
      // Keep existing status
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    if (isOpen) {
      getHeartStatus()
        .then((data) => {
          if (!ignore) {
            setHeartStatus(data);
          }
        })
        .catch(() => {});
    }

    return () => {
      ignore = true;
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleRefillHearts = async () => {
    if (!heartStatus || heartStatus.hearts >= heartStatus.max_hearts) return;
    setActionLoading("refill");
    setFeedback(null);
    try {
      const res = await refillHearts();
      setFeedback({ type: "success", text: res.message });
      await fetchStatus();
      onStatsUpdated?.();
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to refill hearts.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleBuyStreakFreeze = async () => {
    if (!heartStatus || heartStatus.streak_freeze_count >= heartStatus.max_streak_freezes) return;
    setActionLoading("freeze");
    setFeedback(null);
    try {
      const res = await buyStreakFreeze();
      setFeedback({ type: "success", text: res.message });
      await fetchStatus();
      onStatsUpdated?.();
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to buy Streak Freeze.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="surface-card relative w-full max-w-lg rounded-3xl bg-white border-2 border-ink shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b-2 border-ink/10 bg-cream/50">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sun-subtle text-ink border-2 border-sun/60 shadow-xs">
                  <Sparkles className="h-6 w-6 text-sun fill-sun" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold font-display text-ink tracking-tight">
                    Sparks Shop
                  </h2>
                  <p className="text-xs text-ink-muted font-body">
                    Power up your loop with earned Sparks
                  </p>
                </div>
              </div>

              {/* Sparks Balance Pill */}
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sun-subtle border-2 border-sun/50 font-display">
                <Sparkles className="w-4 h-4 text-sun fill-sun" />
                <span className="text-sm font-extrabold text-ink">
                  {heartStatus?.sparks_balance ?? 0}
                </span>
                <span className="text-[11px] font-bold text-ink-muted uppercase">
                  Sparks
                </span>
              </div>
            </div>

            {/* Feedback Alert */}
            {feedback && (
              <div
                className={cn(
                  "mx-5 sm:mx-6 mt-4 p-3 rounded-2xl border text-xs sm:text-sm font-bold font-display flex items-center gap-2",
                  feedback.type === "success"
                    ? "bg-mint border-mint-dark text-mint-dark"
                    : "bg-coral-subtle border-coral text-coral"
                )}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            {/* Shop Item Catalog */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              {/* 1. Refill Hearts Card */}
              <div className="surface-card rounded-2xl p-4 sm:p-5 bg-white border-2 border-ink/15 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-coral-subtle text-coral border border-coral/30 shrink-0">
                    <Heart className="h-6 w-6 fill-coral" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold font-display text-base text-ink">
                        Refill Hearts
                      </h4>
                      <span className="text-[11px] font-bold text-coral bg-coral-subtle px-2 py-0.5 rounded-full border border-coral/30">
                        {heartStatus?.hearts ?? 5}/{heartStatus?.max_hearts ?? 5}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted font-body">
                      Instantly restore your hearts to full capacity (5/5).
                    </p>
                  </div>
                </div>

                <Button
                  variant={
                    heartStatus && heartStatus.hearts >= heartStatus.max_hearts
                      ? "ghost"
                      : "coral"
                  }
                  size="sm"
                  disabled={
                    Boolean(
                      heartStatus &&
                        (heartStatus.hearts >= heartStatus.max_hearts ||
                          heartStatus.sparks_balance < 50)
                    ) || actionLoading === "refill"
                  }
                  onClick={handleRefillHearts}
                  className="w-full sm:w-auto shrink-0 min-w-[130px]"
                >
                  {actionLoading === "refill" ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : heartStatus && heartStatus.hearts >= heartStatus.max_hearts ? (
                    <span>Full (5/5)</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 fill-white" />
                      <span>50 Sparks</span>
                    </div>
                  )}
                </Button>
              </div>

              {/* 2. Streak Freeze Card */}
              <div className="surface-card rounded-2xl p-4 sm:p-5 bg-white border-2 border-ink/15 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-aqua-subtle text-aqua border border-aqua/30 shrink-0">
                    <Shield className="h-6 w-6 fill-aqua" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold font-display text-base text-ink">
                        Streak Freeze
                      </h4>
                      <span className="text-[11px] font-bold text-aqua bg-aqua-subtle px-2 py-0.5 rounded-full border border-aqua/30">
                        {heartStatus?.streak_freeze_count ?? 0}/2 Equipped
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted font-body">
                      Protects your loop streak from resetting if you miss one day.
                    </p>
                  </div>
                </div>

                <Button
                  variant={
                    heartStatus && heartStatus.streak_freeze_count >= 2
                      ? "ghost"
                      : "violet"
                  }
                  size="sm"
                  disabled={
                    Boolean(
                      heartStatus &&
                        (heartStatus.streak_freeze_count >= 2 ||
                          heartStatus.sparks_balance < 100)
                    ) || actionLoading === "freeze"
                  }
                  onClick={handleBuyStreakFreeze}
                  className="w-full sm:w-auto shrink-0 min-w-[130px]"
                >
                  {actionLoading === "freeze" ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : heartStatus && heartStatus.streak_freeze_count >= 2 ? (
                    <span>Max (2/2)</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 fill-white" />
                      <span>100 Sparks</span>
                    </div>
                  )}
                </Button>
              </div>

              {/* 3. Practice for Free Hearts Info Card */}
              <div className="surface-card rounded-2xl p-4 sm:p-5 bg-mint/30 border-2 border-mint-dark/20 text-ink space-y-1.5">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-mint-dark fill-mint-dark" />
                  <h5 className="text-xs font-extrabold font-display uppercase tracking-wider text-mint-dark">
                    Free Heart Recovery
                  </h5>
                </div>
                <p className="text-xs text-ink-muted font-body leading-relaxed">
                  Low on hearts? Replay any mastered Loop Island lesson with 80%+ accuracy to recover <strong className="text-ink font-bold">+1 Heart</strong> for free without spending Sparks.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-ink/10 bg-cream/40 flex justify-end">
              <Button variant="outline" size="sm" onClick={onClose}>
                <span>Close</span>
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
