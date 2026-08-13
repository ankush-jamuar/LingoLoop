"use client";

import React from "react";
import { Flame, Heart, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatsPillProps {
  type: "xp" | "streak" | "hearts" | "gems";
  value: number | string;
  maxValue?: number;
  label?: string;
  className?: string;
}

export function StatsPill({
  type,
  value,
  maxValue,
  label,
  className,
}: StatsPillProps) {
  const configs = {
    xp: {
      icon: Zap,
      iconColor: "text-violet fill-violet",
      bgColor: "bg-violet-subtle/80 border-violet/30 hover:bg-violet-subtle",
      textColor: "text-violet font-extrabold",
      title: "Momentum (Total XP)",
    },
    streak: {
      icon: Flame,
      iconColor: "text-coral fill-coral",
      bgColor: "bg-coral-subtle/80 border-coral/30 hover:bg-coral-subtle",
      textColor: "text-coral font-extrabold",
      title: "Daily Streak",
    },
    hearts: {
      icon: Heart,
      iconColor: "text-coral fill-coral",
      bgColor: "bg-coral-subtle/60 border-coral/25 hover:bg-coral-subtle",
      textColor: "text-ink font-extrabold",
      title: "Health Hearts",
    },
    gems: {
      icon: Sparkles,
      iconColor: "text-sun fill-sun",
      bgColor: "bg-sun-subtle/80 border-sun/40 hover:bg-sun-subtle",
      textColor: "text-ink font-extrabold",
      title: "Sparks (Gems)",
    },
  };

  const current = configs[type];
  const Icon = current.icon;

  return (
    <div
      title={current.title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3 py-1 text-xs font-display select-none transition-all shadow-2xs cursor-default",
        current.bgColor,
        className
      )}
    >
      <Icon className={cn("w-3.5 h-3.5", current.iconColor)} />
      <span className={cn("leading-none", current.textColor)}>
        {value}
        {maxValue !== undefined && (
          <span className="text-[11px] font-semibold text-ink-subtle ml-0.5">
            /{maxValue}
          </span>
        )}
      </span>
      {label && (
        <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider hidden md:inline">
          {label}
        </span>
      )}
    </div>
  );
}
