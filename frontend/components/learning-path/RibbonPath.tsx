import React from "react";
import { cn } from "@/lib/utils";

interface RibbonPathProps {
  direction?: "left-to-center" | "center-to-right" | "right-to-center" | "center-to-left" | "vertical";
  isCompleted?: boolean;
  className?: string;
}

export function RibbonPath({
  direction = "vertical",
  isCompleted = false,
  className,
}: RibbonPathProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-full h-12 sm:h-16 pointer-events-none -my-2 overflow-visible",
        className
      )}
    >
      <svg
        viewBox="0 0 120 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-24 h-full overflow-visible"
      >
        {/* Background Track Line */}
        <path
          d={
            direction === "center-to-right"
              ? "M60 0 C 60 30, 95 30, 95 60"
              : direction === "right-to-center"
              ? "M95 0 C 95 30, 60 30, 60 60"
              : direction === "center-to-left"
              ? "M60 0 C 60 30, 25 30, 25 60"
              : direction === "left-to-center"
              ? "M25 0 C 25 30, 60 30, 60 60"
              : "M60 0 L60 60"
          }
          stroke={isCompleted ? "#DDF5E9" : "#E2D7C8"}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={isCompleted ? "none" : "8 6"}
        />

        {/* Completed Indicator Track */}
        {isCompleted && (
          <path
            d={
              direction === "center-to-right"
                ? "M60 0 C 60 30, 95 30, 95 60"
                : direction === "right-to-center"
                ? "M95 0 C 95 30, 60 30, 60 60"
                : direction === "center-to-left"
                ? "M60 0 C 60 30, 25 30, 25 60"
                : direction === "left-to-center"
                ? "M25 0 C 25 30, 60 30, 60 60"
                : "M60 0 L60 60"
            }
            stroke="#35C7B4"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
}
