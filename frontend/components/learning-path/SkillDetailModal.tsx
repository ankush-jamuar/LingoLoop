"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Crown,
  CheckCircle2,
  Circle,
  Zap,
  ArrowRight,
} from "lucide-react";
import { SkillMapNode } from "@/lib/api/course";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface SkillDetailModalProps {
  skill: SkillMapNode | null;
  isOpen: boolean;
  onClose: () => void;
  onStartLesson: (skill: SkillMapNode, lessonId?: number) => void;
}

export function SkillDetailModal({
  skill,
  isOpen,
  onClose,
  onStartLesson,
}: SkillDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!skill) return null;

  const isCompleted = skill.status === "completed" || skill.completed;
  const isInProgress = skill.status === "in_progress";

  // Find next actionable lesson
  const nextLesson =
    skill.lessons.find((l) => !l.is_completed) || skill.lessons[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="surface-card relative w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-white border-2 border-ink shadow-2xl z-10 space-y-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      isCompleted ? "mint" : isInProgress ? "coral" : "violet"
                    }
                    size="sm"
                  >
                    {isCompleted
                      ? "Mastered"
                      : isInProgress
                      ? "In Progress"
                      : "Unlocked"}
                  </Badge>
                  {skill.crown_level > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold font-display text-ink">
                      <Crown className="w-3.5 h-3.5 fill-sun text-ink" />
                      Crown {skill.crown_level}
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-extrabold text-ink font-display tracking-tight">
                  {skill.title}
                </h3>
                {skill.subtitle && (
                  <p className="text-xs sm:text-sm font-semibold text-ink-muted">
                    {skill.subtitle}
                  </p>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="rounded-full p-2 text-ink-muted hover:text-ink hover:bg-cream-muted transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            {skill.description && (
              <p className="text-xs sm:text-sm text-ink-muted font-body leading-relaxed border-t border-ink/10 pt-3">
                {skill.description}
              </p>
            )}

            {/* Lesson Sequence List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold font-display text-ink-subtle uppercase tracking-wider">
                <span>Lessons in this Loop</span>
                <span>
                  {skill.lessons_completed} / {skill.total_lessons} Completed
                </span>
              </div>

              <div className="space-y-2">
                {skill.lessons.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-xl border transition-colors",
                      lesson.is_completed
                        ? "bg-mint/30 border-mint-dark/30 text-ink"
                        : idx === skill.lessons_completed
                        ? "bg-coral-subtle/50 border-coral/40 text-ink"
                        : "bg-cream-muted/40 border-ink/10 text-ink-muted"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {lesson.is_completed ? (
                        <CheckCircle2 className="w-4 h-4 text-mint-dark" />
                      ) : idx === skill.lessons_completed ? (
                        <Circle className="w-4 h-4 text-coral fill-coral/20" />
                      ) : (
                        <Circle className="w-4 h-4 text-ink-subtle" />
                      )}
                      <span className="text-xs sm:text-sm font-bold font-display">
                        {lesson.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-extrabold font-display text-violet">
                      <Zap className="w-3.5 h-3.5 fill-violet" />
                      <span>+{lesson.xp_reward} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Button
                variant={isCompleted ? "violet" : "coral"}
                size="lg"
                onClick={() => onStartLesson(skill, nextLesson?.id)}
                className="w-full"
              >
                <span>
                  {isCompleted
                    ? "Practice this Loop"
                    : `Start ${nextLesson?.title || "Lesson"}`}
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
