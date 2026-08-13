"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Logo } from "@/components/branding/Logo";
import { StatsPill } from "@/components/ui/StatsPill";
import { getHealthStatus } from "@/lib/api/health";
import { LearnerProfile } from "@/lib/api/learner";
import { RefreshCw, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  learner?: LearnerProfile | null;
}

export function Navbar({ learner }: NavbarProps) {
  const [apiStatus, setApiStatus] = useState<
    "checking" | "connected" | "offline"
  >("checking");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkStatus = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    }
    try {
      const res = await getHealthStatus();
      if (res.status === "ok") {
        setApiStatus("connected");
      } else {
        setApiStatus("offline");
      }
    } catch {
      setApiStatus("offline");
    } finally {
      if (isManual) {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    getHealthStatus()
      .then((res) => {
        if (!ignore) {
          setApiStatus(res.status === "ok" ? "connected" : "offline");
        }
      })
      .catch(() => {
        if (!ignore) {
          setApiStatus("offline");
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ink/10 bg-cream/95 backdrop-blur-md transition-all select-none">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 h-16 sm:h-20">
        {/* Left: Brand Wordmark */}
        <Logo size="md" />

        {/* Center / Right: Live Learner Stats */}
        {learner && (
          <div className="hidden sm:flex items-center gap-2 sm:gap-2.5">
            {/* Streak */}
            <StatsPill
              type="streak"
              value={learner.stats.current_streak}
              label="Streak"
            />

            {/* Hearts */}
            <StatsPill
              type="hearts"
              value={learner.stats.hearts}
              maxValue={learner.stats.max_hearts}
            />

            {/* Sparks (Gems) */}
            <StatsPill
              type="gems"
              value={learner.stats.gems}
            />

            {/* Momentum (XP) */}
            <StatsPill
              type="xp"
              value={`${learner.stats.total_xp} XP`}
            />
          </div>
        )}

        {/* Right Section: API Status & User Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Lightweight API status indicator */}
          <button
            onClick={() => checkStatus(true)}
            disabled={isRefreshing}
            title="Click to re-check backend health"
            className={cn(
              "hidden md:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold font-display transition-colors cursor-pointer",
              apiStatus === "connected"
                ? "bg-mint/80 border-mint-dark/20 text-mint-dark hover:bg-mint"
                : apiStatus === "checking"
                ? "bg-sun-subtle border-sun/30 text-ink-muted"
                : "bg-coral-subtle border-coral/30 text-coral hover:bg-coral-subtle/80"
            )}
          >
            {apiStatus === "connected" ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aqua opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-aqua"></span>
                </span>
                <span>API Connected</span>
              </>
            ) : apiStatus === "checking" ? (
              <>
                <RefreshCw className={cn("h-3 w-3 text-sun", isRefreshing && "animate-spin")} />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <span className="inline-flex h-2 w-2 rounded-full bg-coral"></span>
                <span>Offline</span>
              </>
            )}
          </button>

          {/* Learner Identity Pill */}
          {learner ? (
            <div
              title={`Logged in as ${learner.name} (${learner.email})`}
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-2.5 sm:px-3 py-1 text-xs font-bold font-display text-ink shadow-2xs cursor-default"
            >
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-mint text-mint-dark font-extrabold text-[10px]">
                {learner.name.charAt(0)}
              </div>
              <span className="hidden sm:inline">{learner.name}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cream-muted border border-ink/10 text-ink-muted">
              <UserIcon className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
