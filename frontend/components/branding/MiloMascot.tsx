"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MiloMascotProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  mood?: "cheerful" | "curious" | "celebrating" | "encouraging";
  speechBubbleText?: string;
  className?: string;
}

export function MiloMascot({
  size = "md",
  mood = "cheerful",
  speechBubbleText,
  className,
}: MiloMascotProps) {
  const dimensions = {
    xs: "w-12 h-12",
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-44 h-44",
    xl: "w-56 h-56",
    "2xl": "w-72 h-72",
  };

  const getAnimationConfig = () => {
    switch (mood) {
      case "celebrating":
        return {
          y: [0, -12, 0, -6, 0],
          rotate: [-3, 3, -2, 2, 0],
          transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" as const },
        };
      case "encouraging":
        return {
          y: [0, -4, 0],
          rotate: [-1.5, 1.5, -1.5],
          transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
        };
      case "curious":
        return {
          y: [0, -6, 0],
          rotate: [-2, 3, -2],
          transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" as const },
        };
      case "cheerful":
      default:
        return {
          y: [0, -7, 0],
          rotate: [0, 1.5, 0],
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
        };
    }
  };

  const anim = getAnimationConfig();

  return (
    <div
      className={cn(
        "relative flex items-center justify-center select-none",
        speechBubbleText ? "gap-3" : "",
        className
      )}
      aria-label="Milo — LingoLoop Mascot"
    >
      <motion.div
        animate={{ y: anim.y, rotate: anim.rotate }}
        transition={anim.transition}
        className={cn("relative shrink-0", dimensions[size])}
      >
        <svg
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          {/* Milo's Loop Antenna */}
          <path
            d="M80 34V18M80 18C80 12.4772 84.4772 8 90 8C95.5228 8 100 12.4772 100 18C100 23.5228 95.5228 28 90 28H80"
            stroke="#7567F8"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="90"
            cy="18"
            r={mood === "celebrating" ? "4.5" : "3.5"}
            fill={mood === "celebrating" ? "#FF6B5F" : "#FFC857"}
          />

          {/* Speech-Bubble Body Shadow */}
          <path
            d="M32 46C32 37.1634 39.1634 30 48 30H112C120.837 30 128 37.1634 128 46V106C128 114.837 120.837 122 112 122H68L44 140V122H48C39.1634 122 32 114.837 32 106V46Z"
            fill="#E3D7C7"
            transform="translate(0, 4)"
          />

          {/* Speech-Bubble Main Body */}
          <path
            d="M32 46C32 37.1634 39.1634 30 48 30H112C120.837 30 128 37.1634 128 46V106C128 114.837 120.837 122 112 122H68L44 140V122H48C39.1634 122 32 114.837 32 106V46Z"
            fill="#FFFFFF"
            stroke="#18202A"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Soft Mint Belly Patch */}
          <ellipse
            cx="80"
            cy="84"
            rx="36"
            ry="24"
            fill="#DDF5E9"
            className="opacity-70"
          />

          {/* Eyes based on mood */}
          {mood === "curious" ? (
            <>
              <circle cx="62" cy="74" r="7" fill="#18202A" />
              <circle cx="64" cy="72" r="2.5" fill="#FFFFFF" />
              <path
                d="M90 74C93 70 101 70 104 74"
                stroke="#18202A"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </>
          ) : mood === "celebrating" ? (
            <>
              {/* Joyful Star / Arch Eyes */}
              <path
                d="M56 75C60 67 68 67 72 75"
                stroke="#18202A"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <path
                d="M88 75C92 67 100 67 104 75"
                stroke="#18202A"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
            </>
          ) : mood === "encouraging" ? (
            <>
              {/* Gentle Supportive Eyes */}
              <ellipse cx="64" cy="74" rx="6" ry="7" fill="#18202A" />
              <circle cx="66" cy="72" r="2" fill="#FFFFFF" />
              <ellipse cx="96" cy="74" rx="6" ry="7" fill="#18202A" />
              <circle cx="98" cy="72" r="2" fill="#FFFFFF" />
            </>
          ) : (
            <>
              {/* Cheerful Normal Eyes */}
              <ellipse cx="64" cy="74" rx="6.5" ry="8" fill="#18202A" />
              <circle cx="66.5" cy="71.5" r="2.5" fill="#FFFFFF" />
              <ellipse cx="96" cy="74" rx="6.5" ry="8" fill="#18202A" />
              <circle cx="98.5" cy="71.5" r="2.5" fill="#FFFFFF" />
            </>
          )}

          {/* Coral Cheeks */}
          <circle cx="50" cy="84" r="5.5" fill="#FF6B5F" className="opacity-60" />
          <circle cx="110" cy="84" r="5.5" fill="#FF6B5F" className="opacity-60" />

          {/* Mouth */}
          {mood === "celebrating" ? (
            <>
              <path
                d="M68 84C68 93 74 98 80 98C86 98 92 93 92 84Z"
                fill="#FF6B5F"
                stroke="#18202A"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <path
                d="M74 92C77 95 83 95 86 92"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </>
          ) : mood === "encouraging" ? (
            <path
              d="M74 86C76 89 80 90 86 86"
              stroke="#18202A"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ) : (
            <>
              <path
                d="M72 84C72 89 75.5 94 80 94C84.5 94 88 89 88 84"
                stroke="#18202A"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M75 87C76.5 91 80 92 80 92C80 92 83.5 91 85 87"
                fill="#FF6B5F"
              />
            </>
          )}

          {/* Dialogue / Speech Sparkles */}
          <circle cx="138" cy="42" r="4" fill="#35C7B4" />
          <circle cx="146" cy="32" r="2.5" fill="#FFC857" />
          <path
            d="M24 64L20 60M20 68L16 64"
            stroke="#7567F8"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      {/* Optional Contextual Speech Bubble */}
      {speechBubbleText && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: -6 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="relative bg-white border-2 border-ink rounded-2xl px-3.5 py-2 shadow-xs text-xs sm:text-sm font-bold font-display text-ink max-w-[220px]"
        >
          {speechBubbleText}
          {/* Arrow */}
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-ink" />
          <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[7px] border-r-white" />
        </motion.div>
      )}
    </div>
  );
}
