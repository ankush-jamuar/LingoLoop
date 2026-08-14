"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Logo } from "@/components/branding/Logo";
import { MiloMascot } from "@/components/branding/MiloMascot";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { getNextLesson } from "@/lib/api/learner";
import {
  ArrowRight,
  Flame,
  Zap,
  Sparkles,
  Trophy,
  Layers,
  Heart,
  Compass,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartLearning = async () => {
    setIsStarting(true);
    try {
      const next = await getNextLesson();
      if (next?.lesson_id) {
        router.push(`/lesson/${next.lesson_id}`);
      } else {
        router.push("/lesson/1");
      }
    } catch {
      router.push("/lesson/1");
    } finally {
      setIsStarting(false);
    }
  };

  const steps = [
    { label: "Learn", color: "bg-coral text-white", desc: "Core vocabulary & dialogue" },
    { label: "Practice", color: "bg-sun text-ink", desc: "Multi-format interactive drills" },
    { label: "Recall", color: "bg-aqua text-ink", desc: "Compounding memory retention" },
    { label: "Earn", color: "bg-violet text-white", desc: "Momentum XP & Sparks" },
    { label: "Repeat", color: "bg-mint-dark text-white", desc: "Mastery & League climbs" },
  ];

  const features = [
    {
      icon: Layers,
      color: "text-violet bg-violet-subtle border-violet/30",
      title: "Tactile Loop Map",
      desc: "Navigate 9 progressive Loop Islands across thematic units, earning mastery crowns as you close learning loops.",
    },
    {
      icon: Sparkles,
      color: "text-coral bg-coral-subtle border-coral/30",
      title: "5 Dynamic Exercise Types",
      desc: "Interactive word bank translations, tactile pair matching, fill-in-the-blank, multiple choice, and forgiving typed answers.",
    },
    {
      icon: Trophy,
      color: "text-sun bg-sun-subtle border-sun/40",
      title: "Momentum League",
      desc: "Compete with 9 peer learners in the weekly Silver Loop League. Top 4 promote to Gold Loop with live podium celebrations.",
    },
    {
      icon: Heart,
      color: "text-aqua bg-aqua-subtle border-aqua/30",
      title: "Sparks Economy & Heart Refills",
      desc: "Spend Sparks in the shop for instant heart refills and Streak Freeze shields, or practice mastered loops for free heart recovery.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-cream selection:bg-mint selection:text-ink font-body">
      {/* Top Welcome Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-ink/10 bg-cream/95 backdrop-blur-md transition-all select-none">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 h-16 sm:h-20">
          <Logo size="md" showTagline={false} />

          <div className="flex items-center gap-3">
            <Link href="/learn" className="hidden sm:inline-flex">
              <Button
                variant="outline"
                size="md"
                className="bg-white hover:bg-cream-muted text-ink border-2 border-ink shadow-[0_2px_0_0_#18202A] cursor-pointer"
              >
                <Compass className="w-4 h-4 mr-1.5 text-violet" />
                <span>Loop Map</span>
              </Button>
            </Link>

            <Button
              variant="coral"
              size="md"
              onClick={handleStartLearning}
              disabled={isStarting}
              className="shadow-[0_3px_0_0_#18202A] cursor-pointer"
            >
              <span>{isStarting ? "Starting..." : "Start Learning"}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center">
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Hero Text & Differentiated CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sun-subtle border-2 border-sun/50 text-ink text-xs font-extrabold font-display uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-sun fill-sun" />
                <span>The Cognitive Language Loop</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink font-display tracking-tight leading-[1.1]">
                Learn. Loop. <br className="hidden sm:inline" />
                <span className="text-coral underline decoration-sun decoration-wavy decoration-4">
                  Level up.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-ink-muted leading-relaxed max-w-xl mx-auto lg:mx-0 font-body">
                Master Spanish through structured cognitive learning loops. Build
                momentum with multi-format practice, climb the Momentum League,
                and compound your fluency one loop at a time.
              </p>

              {/* Differentiated CTA Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                {/* 1. Start Learning: Direct Jump into First Available Lesson */}
                <Button
                  variant="coral"
                  size="lg"
                  onClick={handleStartLearning}
                  disabled={isStarting}
                  className="w-full sm:w-auto shadow-[0_5px_0_0_#18202A] text-base cursor-pointer"
                >
                  <span>{isStarting ? "Loading Lesson..." : "Start Learning"}</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                {/* 2. Explore Loop Map: Visual Course Overview */}
                <Link href="/learn" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto bg-white hover:bg-cream-muted text-base cursor-pointer border-2 border-ink shadow-[0_5px_0_0_#18202A]"
                  >
                    <Compass className="w-5 h-5 mr-2 text-violet" />
                    <span>Explore Loop Map</span>
                  </Button>
                </Link>
              </div>

              {/* Quick Stat Highlights */}
              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-extrabold font-display text-ink-subtle">
                <div className="flex items-center gap-1.5 text-ink">
                  <Zap className="w-4 h-4 text-violet fill-violet" />
                  <span>Momentum XP</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5 text-ink">
                  <Flame className="w-4 h-4 text-coral fill-coral" />
                  <span>Streak Defense</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5 text-ink">
                  <Trophy className="w-4 h-4 text-sun fill-sun" />
                  <span>Silver League</span>
                </div>
              </div>
            </motion.div>

            {/* Right Hero: Prominent Animated Milo Mascot */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              className="lg:col-span-5 flex flex-col items-center justify-center relative"
            >
              {/* Decorative Background Blob */}
              <div className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-gradient-to-tr from-coral-subtle via-sun-subtle to-mint -z-10 blur-3xl opacity-70" />

              <div className="surface-card relative rounded-3xl p-8 sm:p-10 bg-white/90 backdrop-blur-md border-2 border-ink shadow-[0_8px_0_0_#18202A] flex flex-col items-center text-center space-y-4">
                <MiloMascot
                  size="xl"
                  mood="cheerful"
                  speechBubbleText="¡Hola! Ready to loop into Spanish?"
                />

                <div className="space-y-1 pt-2">
                  <h3 className="text-lg font-extrabold font-display text-ink">
                    Meet Milo!
                  </h3>
                  <p className="text-xs text-ink-muted max-w-[240px]">
                    Your companion who guides your feedback, celebrates loops, and keeps your momentum alive.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Cognitive Loop Mechanism Strip */}
        <section className="w-full bg-white border-y-2 border-ink/10 py-12 px-4 sm:px-6 select-none">
          <div className="max-w-6xl mx-auto text-center space-y-8">
            <div className="space-y-1.5">
              <span className="text-xs font-extrabold font-display uppercase tracking-widest text-coral">
                The Core Methodology
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink font-display tracking-tight">
                How the Cognitive Loop Works
              </h2>
            </div>

            {/* 5-Step Loop Progression */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {steps.map((step, idx) => (
                <div
                  key={step.label}
                  className="surface-card rounded-2xl p-5 bg-cream border-2 border-ink/15 text-center space-y-2 shadow-xs transition-transform hover:-translate-y-1"
                >
                  <div
                    className={`w-8 h-8 rounded-full ${step.color} mx-auto flex items-center justify-center text-xs font-extrabold font-display shadow-xs`}
                  >
                    {idx + 1}
                  </div>
                  <h3 className="text-base font-extrabold font-display text-ink">
                    {step.label}
                  </h3>
                  <p className="text-xs text-ink-muted leading-relaxed font-body">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs font-extrabold font-display uppercase tracking-widest text-violet">
              Engineered for Retention
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink font-display tracking-tight">
              A Complete Language Learning Platform
            </h2>
            <p className="text-sm sm:text-base text-ink-muted max-w-2xl mx-auto">
              Everything built with real database persistence, authoritative validation, and responsive gamification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="surface-card rounded-3xl p-6 sm:p-8 bg-white border-2 border-ink shadow-[0_6px_0_0_#18202A] space-y-3 transition-transform hover:-translate-y-0.5"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl border-2 ${feat.color} flex items-center justify-center shadow-xs`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-extrabold font-display text-ink tracking-tight">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-ink-muted leading-relaxed font-body">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom Evaluator Call to Action */}
        <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-20">
          <div className="surface-card rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-violet to-violet-hover text-white text-center space-y-6 shadow-[0_8px_0_0_#18202A] border-2 border-ink">
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
                Ready to explore LingoLoop?
              </h2>
              <p className="text-sm sm:text-base text-white/80 max-w-lg mx-auto font-body">
                Jump right in to experience the interactive Loop Map, live lesson player, and gamification economy.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="coral"
                size="lg"
                onClick={handleStartLearning}
                disabled={isStarting}
                className="w-full sm:w-auto shadow-[0_5px_0_0_#18202A] text-base cursor-pointer bg-coral hover:bg-coral-hover text-white border-2 border-ink"
              >
                <span>{isStarting ? "Loading..." : "Start Learning Now"}</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Link href="/learn" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto shadow-[0_5px_0_0_#18202A] text-base cursor-pointer bg-white hover:bg-cream-muted text-ink border-2 border-ink"
                >
                  <Compass className="w-5 h-5 mr-2 text-violet" />
                  <span>Explore Loop Map</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
