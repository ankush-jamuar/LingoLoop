"use client";

import React from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MiloMascot } from "@/components/branding/MiloMascot";
import { LearningLoop } from "@/components/preview/LearningLoop";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, Sparkles, Compass, Flame } from "lucide-react";

export default function HomePage() {
  const scrollToLoop = () => {
    const el = document.getElementById("loop-preview");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream selection:bg-mint selection:text-ink">
      <Navbar />

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Preview Section */}
        <section className="w-full pt-10 pb-12 sm:pt-16 sm:pb-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Brand Headline, Tagline, & CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6"
              >
                {/* Product Concept Badge */}
                <div className="inline-flex items-center gap-2">
                  <Badge variant="mint" size="md">
                    <Sparkles className="w-3 h-3 text-mint-dark" />
                    <span>Iterative Language Learning</span>
                  </Badge>
                </div>

                {/* Main Brand Title & Tagline */}
                <div className="space-y-2">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink font-display tracking-tight leading-[1.08]">
                    Learn. <span className="text-coral">Loop.</span>{" "}
                    <span className="text-violet">Level up.</span>
                  </h1>
                  <p className="text-lg sm:text-xl font-semibold text-ink-muted font-display pt-1">
                    Master any language through cyclical cognitive loops.
                  </p>
                </div>

                {/* Brief Editorial Description */}
                <p className="text-sm sm:text-base text-ink-muted font-body max-w-lg leading-relaxed">
                  LingoLoop reimagines language practice around a proven cognitive
                  cadence: bite-sized concepts, active recall drills, spaced
                  reinforcement, and compounding mastery.
                </p>

                {/* Action CTAs */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
                  <Button
                    variant="coral"
                    size="lg"
                    onClick={scrollToLoop}
                    className="w-full sm:w-auto"
                  >
                    <span>Start learning</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={scrollToLoop}
                    className="w-full sm:w-auto"
                  >
                    <Compass className="w-4 h-4 mr-1 text-violet" />
                    <span>Explore the loop</span>
                  </Button>
                </div>

                {/* Minimal Micro-Trust Bar */}
                <div className="pt-3 flex items-center gap-4 text-xs font-semibold text-ink-subtle">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-coral"></span>
                    No robotic drills
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet"></span>
                    Context-first recall
                  </span>
                </div>
              </motion.div>

              {/* Right Column: Milo Mascot & Tactile Brand Preview Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                className="lg:col-span-5 flex flex-col items-center"
              >
                <div className="relative w-full max-w-sm">
                  {/* Background Soft Glow Surface */}
                  <div className="absolute inset-0 bg-gradient-to-br from-mint/50 via-coral-subtle/30 to-violet-subtle/40 rounded-3xl blur-xl -z-10" />

                  {/* Surface Card Frame */}
                  <div className="surface-card rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
                    {/* Mascot Concept Display */}
                    <div className="relative py-2">
                      <MiloMascot size="lg" mood="cheerful" />
                    </div>

                    {/* Character Introduction */}
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cream-muted border border-ink/10 text-[11px] font-bold font-display text-ink-muted">
                        <Flame className="w-3 h-3 text-sun fill-sun" />
                        <span>Meet Milo • Learning Companion</span>
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-ink font-display pt-1">
                        Ready when you are!
                      </h2>
                      <p className="text-xs text-ink-muted font-body leading-relaxed">
                        “Let’s loop through your daily concepts together.”
                      </p>
                    </div>

                    {/* Cadence Mini Pill */}
                    <div className="w-full pt-2 border-t border-ink/10 flex items-center justify-between text-[11px] font-bold font-display text-ink-subtle">
                      <span>Concept Preview</span>
                      <span className="text-coral">Phase 1 Foundation</span>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* 5-Step Learning Loop Interactive Showcase */}
        <LearningLoop />
      </main>

      <Footer />
    </div>
  );
}
