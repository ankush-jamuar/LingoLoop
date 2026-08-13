"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MiloMascotProps {
  size?: "sm" | "md" | "lg";
  mood?: "cheerful" | "curious" | "celebrating";
  className?: string;
}

export function MiloMascot({
  size = "md",
  mood = "cheerful",
  className,
}: MiloMascotProps) {
  const dimensions = {
    sm: "w-24 h-24",
    md: "w-36 h-36",
    lg: "w-48 h-48",
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center select-none",
        dimensions[size],
        className
      )}
      aria-label="Milo - LingoLoop Mascot Concept"
    >
      <motion.div
        animate={{
          y: [0, -6, 0],
          rotate: mood === "curious" ? [-1, 2, -1] : [0, 1.5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative w-full h-full"
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
          <circle cx="90" cy="18" r="3" fill="#FFC857" />

          {/* Speech-Bubble Body Shadow */}
          <path
            d="M32 46C32 37.1634 39.1634 30 48 30H112C120.837 30 128 37.1634 128 46V106C128 114.837 120.837 122 112 122H68L44 140V122H48C39.1634 122 32 114.837 32 106V46Z"
            fill="#E3D7C7"
            transform="translate(0, 4)"
          />

          {/* Speech-Bubble Main Body (Warm Cream / Crisp Outline) */}
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

          {/* Cheerful Eyes */}
          {mood === "curious" ? (
            <>
              {/* Left Curious Eye */}
              <circle cx="62" cy="74" r="7" fill="#18202A" />
              <circle cx="64" cy="72" r="2.5" fill="#FFFFFF" />
              {/* Right Winking Eye */}
              <path
                d="M90 74C93 70 101 70 104 74"
                stroke="#18202A"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              {/* Left Eye */}
              <ellipse cx="64" cy="74" rx="6.5" ry="8" fill="#18202A" />
              <circle cx="66.5" cy="71.5" r="2.5" fill="#FFFFFF" />
              {/* Right Eye */}
              <ellipse cx="96" cy="74" rx="6.5" ry="8" fill="#18202A" />
              <circle cx="98.5" cy="71.5" r="2.5" fill="#FFFFFF" />
            </>
          )}

          {/* Coral Cheeks */}
          <circle cx="50" cy="84" r="5.5" fill="#FF6B5F" className="opacity-60" />
          <circle cx="110" cy="84" r="5.5" fill="#FF6B5F" className="opacity-60" />

          {/* Happy Open Smile */}
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

          {/* Dialogue / Speech Sparkle Accent */}
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
    </div>
  );
}
