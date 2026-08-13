"use client";

import React, { useEffect, useRef } from "react";
import { SanitizedExercise } from "@/lib/api/lesson";

interface FillBlankExerciseProps {
  exercise: SanitizedExercise;
  typedAnswer: string;
  onTypedAnswerChange: (answer: string) => void;
  disabled?: boolean;
}

export function FillBlankExercise({
  exercise,
  typedAnswer,
  onTypedAnswerChange,
  disabled = false,
}: FillBlankExerciseProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled, exercise.id]);

  const template = exercise.sentence_template || exercise.prompt;
  const parts = template.split("___");

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
          Fill in the missing word
        </h2>
      </div>

      {/* Sentence Template with Inline Input */}
      <div className="surface-card rounded-2xl p-6 bg-white border-2 border-ink/20 shadow-sm space-y-4">
        <div className="text-xl sm:text-2xl font-bold font-display text-ink flex flex-wrap items-center gap-2">
          <span>{parts[0]}</span>
          <div className="inline-block relative">
            <input
              ref={inputRef}
              type="text"
              value={typedAnswer}
              disabled={disabled}
              onChange={(e) => onTypedAnswerChange(e.target.value)}
              placeholder="type word..."
              className="px-3 py-1.5 min-w-[120px] sm:min-w-[150px] rounded-xl bg-cream-muted/70 border-2 border-coral text-ink font-extrabold text-lg text-center outline-none focus:ring-4 focus:ring-coral/20 focus:bg-white transition-all"
            />
          </div>
          {parts.length > 1 && <span>{parts[1]}</span>}
        </div>
      </div>
    </div>
  );
}
