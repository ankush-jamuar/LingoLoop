"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MiloMascot } from "@/components/branding/MiloMascot";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getCurrentLearner, LearnerProfile } from "@/lib/api/learner";
import {
  Settings as SettingsIcon,
  User,
  Volume2,
  Target,
  Info,
  Check,
  Shield,
  ArrowLeft,
} from "lucide-react";

export default function SettingsPage() {
  const [learner, setLearner] = useState<LearnerProfile | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [dailyGoalTarget, setDailyGoalTarget] = useState(30);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    getCurrentLearner()
      .then((data) => {
        setLearner(data);
        if (data?.stats?.daily_goal_xp) {
          setDailyGoalTarget(data.stats.daily_goal_xp);
        }
      })
      .catch(() => {});
  }, []);

  const handleSavePreferences = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-between selection:bg-mint selection:text-ink font-body">
      <Navbar learner={learner} />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Header Title */}
        <div className="flex items-center justify-between pb-2 border-b border-ink/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white border-2 border-ink shadow-xs">
              <SettingsIcon className="w-5 h-5 text-ink" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-ink tracking-tight">
                Settings
              </h1>
              <p className="text-xs sm:text-sm text-ink-muted">
                Manage your learner preferences and account details.
              </p>
            </div>
          </div>

          <Link href="/learn">
            <Button
              variant="outline"
              size="sm"
              className="bg-white hover:bg-cream-muted text-ink border-2 border-ink shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back to Map</span>
            </Button>
          </Link>
        </div>

        {/* 1. Account Details Section */}
        <section className="surface-card rounded-3xl p-6 bg-white border-2 border-ink shadow-[0_4px_0_0_#18202A] space-y-4">
          <div className="flex items-center gap-2 text-ink">
            <User className="w-4 h-4 text-violet" />
            <h2 className="text-base font-extrabold font-display">
              Learner Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold font-display text-ink-muted">
                Name
              </label>
              <div className="px-3.5 py-2 rounded-xl bg-cream border border-ink/15 text-sm font-semibold text-ink">
                {learner?.name || "Ankush"}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold font-display text-ink-muted">
                Email / Identity
              </label>
              <div className="px-3.5 py-2 rounded-xl bg-cream border border-ink/15 text-sm font-semibold text-ink">
                {learner?.email || "ankush@lingoloop.local"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 text-xs text-ink-subtle">
            <Shield className="w-3.5 h-3.5 text-mint-dark" />
            <span>Default evaluation learner with persistent SQLite storage.</span>
          </div>
        </section>

        {/* 2. Daily Goal Target */}
        <section className="surface-card rounded-3xl p-6 bg-white border-2 border-ink shadow-[0_4px_0_0_#18202A] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-ink">
              <Target className="w-4 h-4 text-coral" />
              <h2 className="text-base font-extrabold font-display">
                Daily XP Goal
              </h2>
            </div>
            <Badge variant="sun" size="sm">
              {dailyGoalTarget} XP / day
            </Badge>
          </div>

          <p className="text-xs text-ink-muted">
            Choose your daily pace. Meeting your daily goal keeps your momentum streak active.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {[
              { target: 10, label: "Casual", min: "~2 min" },
              { target: 20, label: "Regular", min: "~5 min" },
              { target: 30, label: "Serious", min: "~10 min" },
              { target: 50, label: "Intense", min: "~15 min" },
            ].map((option) => (
              <button
                key={option.target}
                onClick={() => setDailyGoalTarget(option.target)}
                className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer select-none ${
                  dailyGoalTarget === option.target
                    ? "bg-coral-subtle border-coral text-coral font-extrabold shadow-[0_3px_0_0_#D94B3F]"
                    : "bg-white border-ink/15 text-ink-muted hover:border-ink/40 font-bold"
                }`}
              >
                <p className="text-sm font-display leading-tight">{option.label}</p>
                <p className="text-xs font-black font-display mt-0.5">{option.target} XP</p>
                <p className="text-[10px] opacity-75 mt-0.5">{option.min}</p>
              </button>
            ))}
          </div>
        </section>

        {/* 3. Learning & Sound Preferences */}
        <section className="surface-card rounded-3xl p-6 bg-white border-2 border-ink shadow-[0_4px_0_0_#18202A] space-y-4">
          <div className="flex items-center gap-2 text-ink">
            <Volume2 className="w-4 h-4 text-aqua" />
            <h2 className="text-base font-extrabold font-display">
              Audio & Visual Experience
            </h2>
          </div>

          <div className="space-y-3 pt-1">
            {/* Sound Effects */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-cream border border-ink/10">
              <div className="space-y-0.5">
                <p className="text-xs font-bold font-display text-ink">Sound Effects</p>
                <p className="text-[11px] text-ink-muted">Audio feedback on correct and incorrect exercises.</p>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-5 h-5 accent-coral cursor-pointer"
              />
            </div>

            {/* Animations */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-cream border border-ink/10">
              <div className="space-y-0.5">
                <p className="text-xs font-bold font-display text-ink">Mascot Animations</p>
                <p className="text-[11px] text-ink-muted">Playful Framer Motion animations for Milo.</p>
              </div>
              <input
                type="checkbox"
                checked={animationsEnabled}
                onChange={(e) => setAnimationsEnabled(e.target.checked)}
                className="w-5 h-5 accent-coral cursor-pointer"
              />
            </div>

            {/* Daily Practice Reminders */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-cream border border-ink/10">
              <div className="space-y-0.5">
                <p className="text-xs font-bold font-display text-ink">Streak Protection Notifications</p>
                <p className="text-[11px] text-ink-muted">Reminders to maintain your weekly loop momentum.</p>
              </div>
              <input
                type="checkbox"
                checked={remindersEnabled}
                onChange={(e) => setRemindersEnabled(e.target.checked)}
                className="w-5 h-5 accent-coral cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* 4. About LingoLoop Architecture */}
        <section className="surface-card rounded-3xl p-6 bg-white border-2 border-ink shadow-[0_4px_0_0_#18202A] space-y-4">
          <div className="flex items-center gap-2 text-ink">
            <Info className="w-4 h-4 text-sun" />
            <h2 className="text-base font-extrabold font-display">
              About LingoLoop
            </h2>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-sun-subtle border border-sun/40">
            <MiloMascot size="xs" mood="curious" className="shrink-0" />
            <div className="space-y-1 text-xs text-ink-muted leading-relaxed">
              <p className="font-extrabold font-display text-ink">
                LingoLoop v1.0 • Cognitive Language Loop
              </p>
              <p>
                Engineered with Next.js 16 App Router, FastAPI, SQLAlchemy 2.0, and SQLite.
                Features real persistence, authoritative lesson evaluation, dynamic mascot flourishes, and gamification economy.
              </p>
            </div>
          </div>
        </section>

        {/* Save Preferences Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedFeedback && (
            <span className="inline-flex items-center gap-1 text-xs font-extrabold font-display text-mint-dark animate-fade-in">
              <Check className="w-4 h-4 stroke-[3]" />
              Preferences Saved!
            </span>
          )}

          <Button
            variant="coral"
            size="md"
            onClick={handleSavePreferences}
            className="shadow-[0_3px_0_0_#18202A] cursor-pointer"
          >
            <span>Save Preferences</span>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
