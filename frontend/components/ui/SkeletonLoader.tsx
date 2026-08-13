import React from "react";
import { cn } from "@/lib/utils";

export function SkeletonItem({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-ink/10 relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent",
        className
      )}
    />
  );
}

export function TopBarStatsSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <SkeletonItem className="h-7 w-16 rounded-full" />
      <SkeletonItem className="h-7 w-16 rounded-full" />
      <SkeletonItem className="h-7 w-20 rounded-full" />
      <SkeletonItem className="h-7 w-24 rounded-full" />
    </div>
  );
}

export function HeroCardSkeleton() {
  return (
    <div className="surface-card w-full max-w-4xl rounded-2xl p-6 sm:p-8 space-y-4 mx-auto my-6">
      <div className="flex items-center justify-between">
        <SkeletonItem className="h-5 w-32 rounded-full" />
        <SkeletonItem className="h-5 w-20 rounded-full" />
      </div>
      <SkeletonItem className="h-8 w-3/4 rounded-lg" />
      <SkeletonItem className="h-4 w-1/2 rounded-md" />
      <div className="pt-2 flex justify-between items-center">
        <SkeletonItem className="h-10 w-44 rounded-xl" />
        <SkeletonItem className="h-4 w-28 rounded-md" />
      </div>
    </div>
  );
}

export function LoopMapSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-12 py-8">
      {[1, 2].map((u) => (
        <div key={u} className="space-y-6">
          {/* Unit Header Skeleton */}
          <div className="rounded-2xl bg-cream-muted/70 border border-ink/10 p-5 space-y-2">
            <SkeletonItem className="h-4 w-24 rounded-full" />
            <SkeletonItem className="h-6 w-48 rounded-md" />
            <SkeletonItem className="h-3 w-64 rounded-md" />
          </div>

          {/* Skill Nodes Skeleton */}
          <div className="flex flex-col items-center gap-8 py-4">
            <SkeletonItem className="h-20 w-20 rounded-full" />
            <SkeletonItem className="h-20 w-20 rounded-full translate-x-10" />
            <SkeletonItem className="h-20 w-20 rounded-full -translate-x-10" />
          </div>
        </div>
      ))}
    </div>
  );
}
