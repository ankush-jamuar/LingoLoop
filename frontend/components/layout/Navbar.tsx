"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/branding/Logo";
import { StatsPill } from "@/components/ui/StatsPill";
import { SparksShopModal } from "@/components/gamification/SparksShopModal";
import { getHealthStatus } from "@/lib/api/health";
import { LearnerProfile } from "@/lib/api/learner";
import {
  RefreshCw,
  User as UserIcon,
  Map,
  Trophy,
  Award,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  learner?: LearnerProfile | null;
  onStatsUpdated?: () => void;
}

export function Navbar({ learner, onStatsUpdated }: NavbarProps) {
  const pathname = usePathname();
  const [apiStatus, setApiStatus] = useState<
    "checking" | "connected" | "offline"
  >("checking");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);

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

  const navLinks = [
    { href: "/", label: "Loop Map", icon: Map },
    { href: "/leaderboard", label: "League", icon: Trophy },
    { href: "/achievements", label: "Milestones", icon: Award },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-ink/10 bg-cream/95 backdrop-blur-md transition-all select-none">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 h-16 sm:h-20">
          {/* Left: Brand Wordmark & Nav Links */}
          <div className="flex items-center gap-6">
            <Logo size="md" />

            <nav className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-ink/15">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display text-xs font-extrabold transition-all",
                      isActive
                        ? "bg-white text-ink border-2 border-ink shadow-[0_2px_0_0_#18202A]"
                        : "text-ink-muted hover:text-ink hover:bg-cream-muted"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center / Right: Live Learner Stats */}
          {learner && (
            <div className="hidden sm:flex items-center gap-2 sm:gap-2.5">
              {/* Streak */}
              <StatsPill
                type="streak"
                value={learner.stats.current_streak}
                label="Streak"
              />

              {/* Hearts (Clickable to open Sparks Shop) */}
              <div
                onClick={() => setIsShopOpen(true)}
                title="Click to open Sparks Shop / Refill Hearts"
                className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
              >
                <StatsPill
                  type="hearts"
                  value={learner.stats.hearts}
                  maxValue={learner.stats.max_hearts}
                />
              </div>

              {/* Sparks (Clickable to open Sparks Shop) */}
              <div
                onClick={() => setIsShopOpen(true)}
                title="Click to open Sparks Shop"
                className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
              >
                <StatsPill
                  type="gems"
                  value={learner.stats.gems}
                />
              </div>

              {/* Momentum (XP) */}
              <StatsPill
                type="xp"
                value={`${learner.stats.total_xp} XP`}
              />
            </div>
          )}

          {/* Right Section: API Status, Sparks Shop & User Avatar */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Lightweight API status indicator */}
            <button
              onClick={() => checkStatus(true)}
              disabled={isRefreshing}
              title="Click to re-check backend health"
              className={cn(
                "hidden xl:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold font-display transition-colors cursor-pointer",
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

            {/* Sparks Shop Button */}
            <button
              onClick={() => setIsShopOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-sun/60 bg-sun-subtle px-3 py-1 text-xs font-extrabold font-display text-ink hover:bg-sun/30 transition-colors shadow-2xs cursor-pointer"
              title="Open Sparks Shop"
            >
              <Sparkles className="w-3.5 h-3.5 text-sun fill-sun" />
              <span className="hidden md:inline">Shop</span>
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

        {/* Mobile Navigation Bar */}
        <div className="flex lg:hidden items-center justify-around px-2 py-1.5 border-t border-ink/10 bg-cream-muted/50">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-lg font-display text-xs font-bold transition-all",
                  isActive
                    ? "bg-white text-ink shadow-xs border border-ink/15"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Sparks Shop Modal */}
      <SparksShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        onStatsUpdated={onStatsUpdated}
      />
    </>
  );
}

