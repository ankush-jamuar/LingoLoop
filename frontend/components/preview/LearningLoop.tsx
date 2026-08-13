"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Brain, Trophy, Repeat, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoopStep {
  id: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  badgeBg: string;
  icon: React.ElementType;
  previewPrompt: string;
  previewResponse: string;
}

const LOOP_STEPS: LoopStep[] = [
  {
    id: "learn",
    stepNumber: "01",
    title: "Learn",
    subtitle: "Input & Context",
    description:
      "Bite-sized concept introductions, contextual phrases, and high-frequency vocabulary designed for cognitive ease.",
    color: "text-coral border-coral bg-coral",
    badgeBg: "bg-coral-subtle text-coral border-coral/30",
    icon: BookOpen,
    previewPrompt: "New phrase in context",
    previewResponse: "“Bonjour, ravi de vous rencontrer!”",
  },
  {
    id: "practice",
    stepNumber: "02",
    title: "Practice",
    subtitle: "Active Construction",
    description:
      "Dynamic interactive drills that shift your brain from passive recognition to active sentence formation.",
    color: "text-aqua border-aqua bg-aqua",
    badgeBg: "bg-aqua-subtle text-aqua-hover border-aqua/30",
    icon: Sparkles,
    previewPrompt: "Translate to French",
    previewResponse: "Assemble: [Ravi] [de] [vous] [rencontrer]",
  },
  {
    id: "recall",
    stepNumber: "03",
    title: "Recall",
    subtitle: "Spaced Reinforcement",
    description:
      "Smart memory intervals that test weak associations right before they fade, strengthening neurological retention.",
    color: "text-violet border-violet bg-violet",
    badgeBg: "bg-violet-subtle text-violet border-violet/30",
    icon: Brain,
    previewPrompt: "Interval Review",
    previewResponse: "Optimal retrieval curve calculated: 100% match",
  },
  {
    id: "earn",
    stepNumber: "04",
    title: "Earn",
    subtitle: "Tangible Milestones",
    description:
      "Satisfying visual feedback and momentum loops celebrating real mastery rather than superficial streaks.",
    color: "text-sun border-sun bg-sun",
    badgeBg: "bg-sun-subtle text-ink border-sun/40",
    icon: Trophy,
    previewPrompt: "Loop Mastery",
    previewResponse: "+1 Loop Completed • Tier 1 Fluency Unlocked",
  },
  {
    id: "repeat",
    stepNumber: "05",
    title: "Repeat",
    subtitle: "Compounding Growth",
    description:
      "Consistent micro-cycles create effortless language habits, compounding into natural conversational fluency.",
    color: "text-mint-dark border-mint-dark bg-mint",
    badgeBg: "bg-mint text-mint-dark border-mint-dark/20",
    icon: Repeat,
    previewPrompt: "Next Micro-Loop",
    previewResponse: "Ready for: Ordering at a Parisian Café",
  },
];

export function LearningLoop() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = LOOP_STEPS[activeStepIndex];

  return (
    <section id="loop-preview" className="w-full py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-muted border border-ink/15 text-ink-muted text-xs font-bold font-display uppercase tracking-widest mb-3">
            <Repeat className="w-3.5 h-3.5 text-violet animate-spin-slow" />
            <span>The Core Visual & Learning Concept</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-ink font-display tracking-tight">
            How the <span className="text-violet">Lingo</span>
            <span className="text-coral">Loop</span> Works
          </h2>
          <p className="mt-2.5 max-w-xl mx-auto text-sm sm:text-base text-ink-muted leading-relaxed">
            Language mastery is not linear. It is a compounding loop designed to
            take you from first exposure to spontaneous recall.
          </p>
        </div>

        {/* 5-Step Interactive Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 mb-8">
          {LOOP_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === activeStepIndex;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStepIndex(idx)}
                className={cn(
                  "relative flex flex-col items-start p-3.5 sm:p-4 rounded-xl text-left transition-all duration-200 border cursor-pointer select-none",
                  isActive
                    ? "bg-white border-ink shadow-[0_3px_0_0_#18202A] -translate-y-0.5"
                    : "bg-cream-surface/60 border-ink/10 hover:border-ink/25 hover:bg-white"
                )}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-[11px] font-extrabold font-display text-ink-subtle">
                    {step.stepNumber}
                  </span>
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-ink" : "text-ink-subtle"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-sm font-extrabold font-display tracking-tight",
                    isActive ? "text-ink" : "text-ink-muted"
                  )}
                >
                  {step.title}
                </span>
                <span className="text-[11px] text-ink-subtle hidden sm:block truncate w-full">
                  {step.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Step Showcase Card */}
        <div className="surface-card rounded-2xl p-6 sm:p-10 transition-all">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-center"
            >
              {/* Left Details */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold font-display border",
                      activeStep.badgeBg
                    )}
                  >
                    Step {activeStep.stepNumber} • {activeStep.subtitle}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-ink font-display tracking-tight">
                  {activeStep.title}
                </h3>

                <p className="text-sm sm:text-base text-ink-muted leading-relaxed font-body">
                  {activeStep.description}
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() =>
                      setActiveStepIndex((prev) => (prev + 1) % LOOP_STEPS.length)
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold font-display text-ink hover:text-coral transition-colors cursor-pointer"
                  >
                    <span>Next loop phase</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Visual Simulation Preview */}
              <div className="md:col-span-5 bg-cream-tint rounded-xl border border-ink/15 p-5 space-y-3 shadow-inner">
                <div className="flex items-center justify-between border-b border-ink/10 pb-2">
                  <span className="text-[11px] font-bold font-display uppercase tracking-wider text-ink-subtle">
                    {activeStep.previewPrompt}
                  </span>
                  <span className="flex h-2 w-2 rounded-full bg-aqua animate-pulse" />
                </div>
                <div className="bg-white rounded-lg p-3.5 border border-ink/10 shadow-xs">
                  <p className="text-xs sm:text-sm font-semibold text-ink font-display">
                    {activeStep.previewResponse}
                  </p>
                </div>
                <div className="text-[11px] text-ink-subtle flex items-center justify-between pt-1">
                  <span>Loop Progression</span>
                  <span className="font-bold text-ink">
                    {activeStepIndex + 1} / {LOOP_STEPS.length}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
