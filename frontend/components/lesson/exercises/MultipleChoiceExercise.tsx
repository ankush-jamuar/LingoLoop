"use client";

import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { SanitizedExercise } from "@/lib/api/lesson";
import { cn } from "@/lib/utils";

interface MultipleChoiceExerciseProps {
  exercise: SanitizedExercise;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  disabled?: boolean;
}

export function MultipleChoiceExercise({
  exercise,
  selectedOptionId,
  onSelectOption,
  disabled = false,
}: MultipleChoiceExerciseProps) {
  const options = useMemo(() => exercise.options || [], [exercise.options]);

  // Keyboard shortcut listeners (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= options.length) {
        onSelectOption(options[num - 1].id);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [options, disabled, onSelectOption]);

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 select-none">
      {/* Exercise Prompt & Instruction */}
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

      {/* Option Cards Grid */}
      <div className="grid grid-cols-1 gap-3 pt-2">
        {options.map((opt, idx) => {
          const isSelected = selectedOptionId === opt.id;
          return (
            <motion.button
              key={opt.id}
              whileHover={!disabled ? { scale: 1.01, y: -2 } : {}}
              whileTap={!disabled ? { scale: 0.99, y: 1 } : {}}
              disabled={disabled}
              onClick={() => onSelectOption(opt.id)}
              className={cn(
                "group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer text-left font-display",
                isSelected
                  ? "bg-coral-subtle/80 border-coral text-ink shadow-[0_4px_0_0_#D94B3F]"
                  : "bg-white border-ink/20 text-ink shadow-[0_4px_0_0_#D8CBB9] hover:border-ink hover:bg-cream-tint"
              )}
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-xl border text-xs font-extrabold transition-colors",
                    isSelected
                      ? "bg-coral text-white border-coral"
                      : "bg-cream-muted border-ink/15 text-ink-subtle group-hover:border-ink/40 group-hover:text-ink"
                  )}
                >
                  {idx + 1}
                </span>
                <span className="text-base sm:text-lg font-bold">
                  {opt.text}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
