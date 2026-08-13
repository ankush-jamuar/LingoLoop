"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Zap } from "lucide-react";
import { NextLesson } from "@/lib/api/learner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface ContinueLearningCardProps {
  nextLesson: NextLesson | null;
  onStartLesson: (nextLesson: NextLesson) => void;
}

export function ContinueLearningCard({
  nextLesson,
  onStartLesson,
}: ContinueLearningCardProps) {
  if (!nextLesson) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-3xl mx-auto my-6 px-4"
    >
      <div className="surface-card relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-white border-2 border-ink shadow-[0_6px_0_0_#18202A] transition-transform">
        {/* Soft Background Accent Gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-coral-subtle via-sun-subtle to-transparent rounded-full blur-2xl -z-10 opacity-70" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left Context Info */}
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="coral" size="sm">
                <Flame className="w-3 h-3 text-coral fill-coral" />
                <span>Next in the Loop</span>
              </Badge>
              <span className="text-xs font-bold font-display text-ink-subtle">
                {nextLesson.unit_title}
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-ink font-display tracking-tight leading-tight">
                {nextLesson.skill_title} •{" "}
                <span className="text-coral">{nextLesson.lesson_title}</span>
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted font-body leading-relaxed mt-1">
                Keep your 3-day streak going and build your conversational
                momentum.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-extrabold font-display text-violet pt-0.5">
              <span className="inline-flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-violet" />
                +{nextLesson.xp_reward} Momentum XP
              </span>
              <span className="text-ink-subtle">•</span>
              <span className="text-ink-muted">~3 min practice</span>
            </div>
          </div>

          {/* Right Action CTA */}
          <div className="w-full sm:w-auto self-stretch sm:self-center flex sm:flex-col justify-end">
            <Button
              variant="coral"
              size="lg"
              onClick={() => onStartLesson(nextLesson)}
              className="w-full sm:w-auto shadow-[0_4px_0_0_#18202A]"
            >
              <span>Continue learning</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
