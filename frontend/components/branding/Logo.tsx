import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
}

export function Logo({
  size = "md",
  showTagline = false,
  className,
}: LogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 transition-transform duration-200 active:scale-95 focus:outline-none",
        className
      )}
      aria-label="LingoLoop Home"
    >
      {/* Original Loop Icon */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-ink p-1.5 shadow-sm transition-transform duration-300 group-hover:rotate-6",
          iconSizes[size]
        )}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Continuous Loop / Ribbon Geometry */}
          <path
            d="M9 16C9 12.134 12.134 9 16 9C19.866 9 23 12.134 23 16C23 19.866 19.866 23 16 23C12.134 23 9 19.866 9 16Z"
            stroke="#FFF9EF"
            strokeWidth="3"
            strokeLinecap="round"
            className="opacity-20"
          />
          {/* Violet Upper Arc */}
          <path
            d="M8.5 16C8.5 11.8579 11.8579 8.5 16 8.5C20.1421 8.5 23.5 11.8579 23.5 16"
            stroke="#7567F8"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Coral Lower Arc */}
          <path
            d="M23.5 16C23.5 20.1421 20.1421 23.5 16 23.5C11.8579 23.5 8.5 20.1421 8.5 16"
            stroke="#FF6B5F"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Sun Core Loop Point */}
          <circle cx="16" cy="8.5" r="2.5" fill="#FFC857" />
          {/* Aqua Core Loop Point */}
          <circle cx="16" cy="23.5" r="2.5" fill="#35C7B4" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <span
          className={cn(
            "font-extrabold tracking-tight text-ink font-display leading-none",
            textSizes[size]
          )}
        >
          Lingo<span className="text-coral">Loop</span>
        </span>
        {showTagline && (
          <span className="text-[11px] font-semibold tracking-wider text-ink-muted uppercase mt-0.5">
            Learn. Loop. Level up.
          </span>
        )}
      </div>
    </Link>
  );
}
