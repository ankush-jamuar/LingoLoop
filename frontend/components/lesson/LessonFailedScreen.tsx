"use client";

import React from "react";
import { motion } from "framer-motion";
import { HeartCrack, ArrowLeft } from "lucide-react";
import { MiloMascot } from "@/components/branding/MiloMascot";
import { Button } from "@/components/ui/Button";

interface LessonFailedScreenProps {
  onReturnToMap: () => void;
}

export function LessonFailedScreen({
  onReturnToMap,
}: LessonFailedScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto w-full text-center space-y-6 select-none animate-fade-in">
      {/* Milo Mascot */}
      <motion.div
        initial={{ scale: 0.8, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <MiloMascot size="lg" mood="curious" />
      </motion.div>

      {/* Heading */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral-subtle border border-coral/30 text-coral text-xs font-extrabold font-display uppercase tracking-wider">
          <HeartCrack className="w-3.5 h-3.5" />
          <span>Out of Hearts</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink font-display tracking-tight">
          Keep your momentum going!
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-body">
          You made a solid attempt. Mistakes are a natural part of the learning loop. Return to your map to practice previous islands.
        </p>
      </div>

      {/* Action CTA */}
      <div className="w-full pt-4 space-y-2.5">
        <Button
          variant="coral"
          size="lg"
          onClick={onReturnToMap}
          className="w-full shadow-[0_4px_0_0_#18202A]"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Return to Loop Map</span>
        </Button>
      </div>
    </div>
  );
}
