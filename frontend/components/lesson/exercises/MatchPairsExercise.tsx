"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { SanitizedExercise, MatchedPairItem } from "@/lib/api/lesson";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface MatchPairsExerciseProps {
  exercise: SanitizedExercise;
  matchedPairs: MatchedPairItem[];
  onPairsChange: (pairs: MatchedPairItem[]) => void;
  disabled?: boolean;
}

export function MatchPairsExercise({
  exercise,
  matchedPairs,
  onPairsChange,
  disabled = false,
}: MatchPairsExerciseProps) {
  const leftTokens = exercise.pair_left_tokens || [];
  const rightTokens = exercise.pair_right_tokens || [];

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  // Map of matched pairs for quick lookup
  const matchedLeftMap = new Map(matchedPairs.map((p) => [p.left, p.right]));
  const matchedRightMap = new Map(matchedPairs.map((p) => [p.right, p.left]));

  const handleLeftClick = (left: string) => {
    if (disabled) return;

    // If already matched, unmatch it
    if (matchedLeftMap.has(left)) {
      onPairsChange(matchedPairs.filter((p) => p.left !== left));
      return;
    }

    if (selectedRight) {
      // Complete pair
      const newPair: MatchedPairItem = { left, right: selectedRight };
      onPairsChange([...matchedPairs, newPair]);
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      setSelectedLeft(left === selectedLeft ? null : left);
    }
  };

  const handleRightClick = (right: string) => {
    if (disabled) return;

    // If already matched, unmatch it
    if (matchedRightMap.has(right)) {
      onPairsChange(matchedPairs.filter((p) => p.right !== right));
      return;
    }

    if (selectedLeft) {
      // Complete pair
      const newPair: MatchedPairItem = { left: selectedLeft, right };
      onPairsChange([...matchedPairs, newPair]);
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      setSelectedRight(right === selectedRight ? null : right);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 select-none">
      {/* Prompt / Instruction */}
      <div className="space-y-1.5 text-center sm:text-left">
        {exercise.instruction && (
          <span className="text-xs font-bold font-display text-violet uppercase tracking-wider">
            {exercise.instruction}
          </span>
        )}
        <h2 className="text-xl sm:text-2xl font-extrabold text-ink font-display tracking-tight">
          {exercise.prompt}
        </h2>
      </div>

      {/* Pairing Grid */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-2">
        {/* Left Tokens Column */}
        <div className="space-y-3">
          {leftTokens.map((left) => {
            const isMatched = matchedLeftMap.has(left);
            const isSelected = selectedLeft === left;

            return (
              <motion.button
                key={left}
                whileHover={!disabled && !isMatched ? { scale: 1.02 } : {}}
                whileTap={!disabled ? { scale: 0.98 } : {}}
                disabled={disabled}
                onClick={() => handleLeftClick(left)}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 font-display text-sm sm:text-base font-bold transition-all text-center flex items-center justify-between cursor-pointer",
                  isMatched
                    ? "bg-mint/40 border-mint-dark text-mint-dark shadow-[0_3px_0_0_#227B53]"
                    : isSelected
                    ? "bg-violet-subtle border-violet text-violet shadow-[0_4px_0_0_#7567F8] ring-3 ring-violet/20"
                    : "bg-white border-ink/20 text-ink shadow-[0_3px_0_0_#D8CBB9] hover:border-ink hover:bg-cream-tint"
                )}
              >
                <span>{left}</span>
                {isMatched && <Check className="w-4 h-4 text-mint-dark" />}
              </motion.button>
            );
          })}
        </div>

        {/* Right Tokens Column */}
        <div className="space-y-3">
          {rightTokens.map((right) => {
            const isMatched = matchedRightMap.has(right);
            const isSelected = selectedRight === right;

            return (
              <motion.button
                key={right}
                whileHover={!disabled && !isMatched ? { scale: 1.02 } : {}}
                whileTap={!disabled ? { scale: 0.98 } : {}}
                disabled={disabled}
                onClick={() => handleRightClick(right)}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 font-display text-sm sm:text-base font-bold transition-all text-center flex items-center justify-between cursor-pointer",
                  isMatched
                    ? "bg-mint/40 border-mint-dark text-mint-dark shadow-[0_3px_0_0_#227B53]"
                    : isSelected
                    ? "bg-violet-subtle border-violet text-violet shadow-[0_4px_0_0_#7567F8] ring-3 ring-violet/20"
                    : "bg-white border-ink/20 text-ink shadow-[0_3px_0_0_#D8CBB9] hover:border-ink hover:bg-cream-tint"
                )}
              >
                <span>{right}</span>
                {isMatched && <Check className="w-4 h-4 text-mint-dark" />}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
