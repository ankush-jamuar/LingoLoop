"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SanitizedExercise } from "@/lib/api/lesson";
import { Volume2 } from "lucide-react";

interface TranslateExerciseProps {
  exercise: SanitizedExercise;
  assembledTokens: string[];
  onTokenAdd: (token: string, bankIndex: number) => void;
  onTokenRemove: (assembledIndex: number) => void;
  usedBankIndices: Set<number>;
  disabled?: boolean;
}

export function TranslateExercise({
  exercise,
  assembledTokens,
  onTokenAdd,
  onTokenRemove,
  usedBankIndices,
  disabled = false,
}: TranslateExerciseProps) {
  const wordBank = exercise.word_bank || [];

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

      {/* Source Sentence Box */}
      {exercise.source_text && (
        <div className="surface-card rounded-2xl p-4 sm:p-5 bg-white border-2 border-ink/20 shadow-sm flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-subtle text-violet border border-violet/30 shrink-0">
            <Volume2 className="h-4 w-4" />
          </div>
          <span className="text-lg sm:text-xl font-bold font-display text-ink">
            {exercise.source_text}
          </span>
        </div>
      )}

      {/* Assembled Tokens Drop Area */}
      <div className="min-h-[72px] sm:min-h-[84px] p-3 sm:p-4 rounded-2xl border-2 border-dashed border-ink/25 bg-cream-muted/60 flex flex-wrap items-center gap-2">
        <AnimatePresence>
          {assembledTokens.map((token, idx) => (
            <motion.button
              key={`${token}-${idx}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={!disabled ? { scale: 1.05 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              disabled={disabled}
              onClick={() => onTokenRemove(idx)}
              className="px-3.5 py-2 rounded-xl bg-white border-2 border-ink font-bold font-display text-sm sm:text-base text-ink shadow-[0_3px_0_0_#18202A] cursor-pointer hover:bg-coral-subtle hover:border-coral transition-colors"
            >
              {token}
            </motion.button>
          ))}
        </AnimatePresence>

        {assembledTokens.length === 0 && (
          <span className="text-xs font-bold text-ink-subtle font-display pl-2">
            Tap words from the bank below to build your translation
          </span>
        )}
      </div>

      {/* Word Bank Area */}
      <div className="flex flex-wrap justify-center gap-2.5 pt-2">
        {wordBank.map((token, bankIdx) => {
          const isUsed = usedBankIndices.has(bankIdx);
          return (
            <div key={`${token}-${bankIdx}`} className="relative">
              {/* Ghost Placeholder when used */}
              {isUsed ? (
                <div className="px-3.5 py-2 rounded-xl bg-cream-muted/50 border-2 border-ink/10 text-transparent select-none font-bold text-sm sm:text-base">
                  {token}
                </div>
              ) : (
                <motion.button
                  whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
                  whileTap={!disabled ? { scale: 0.95, y: 1 } : {}}
                  disabled={disabled}
                  onClick={() => onTokenAdd(token, bankIdx)}
                  className="px-3.5 py-2 rounded-xl bg-white border-2 border-ink/30 font-bold font-display text-sm sm:text-base text-ink shadow-[0_3px_0_0_#D8CBB9] hover:border-ink hover:bg-cream-tint transition-all cursor-pointer"
                >
                  {token}
                </motion.button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
