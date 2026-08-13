"use client";

import React, { useEffect, useRef } from "react";
import { SanitizedExercise } from "@/lib/api/lesson";

interface TypeAnswerExerciseProps {
  exercise: SanitizedExercise;
  typedAnswer: string;
  onTypedAnswerChange: (answer: string) => void;
  disabled?: boolean;
}

export function TypeAnswerExercise({
  exercise,
  typedAnswer,
  onTypedAnswerChange,
  disabled = false,
}: TypeAnswerExerciseProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled, exercise.id]);

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

      {/* Input Field */}
      <div className="surface-card rounded-2xl p-6 bg-white border-2 border-ink/20 shadow-sm space-y-3">
        <input
          ref={inputRef}
          type="text"
          value={typedAnswer}
          disabled={disabled}
          onChange={(e) => onTypedAnswerChange(e.target.value)}
          placeholder="Type your answer in Spanish..."
          className="w-full px-4 py-3.5 rounded-xl bg-cream-muted/60 border-2 border-ink/20 text-ink font-bold font-display text-lg outline-none focus:border-violet focus:ring-4 focus:ring-violet/20 focus:bg-white transition-all"
        />
        <p className="text-xs text-ink-subtle font-body">
          Accents and capitalization are handled forgivingly.
        </p>
      </div>
    </div>
  );
}
