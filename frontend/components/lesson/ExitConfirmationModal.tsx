"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ExitConfirmationModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirmExit: () => void;
}

export function ExitConfirmationModal({
  isOpen,
  onCancel,
  onConfirmExit,
}: ExitConfirmationModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-ink/50 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="surface-card relative w-full max-w-sm rounded-3xl p-6 bg-white border-2 border-ink shadow-2xl z-10 text-center space-y-4"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-coral-subtle text-coral border border-coral/30">
              <AlertCircle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-ink font-display tracking-tight">
                Leave current loop?
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed font-body">
                You&apos;re making good progress. If you quit now, any uncompleted exercises in this session will not be saved.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <Button
                variant="coral"
                size="md"
                onClick={onCancel}
                className="flex-1 order-1 sm:order-2"
              >
                <span>Keep Learning</span>
              </Button>

              <Button
                variant="ghost"
                size="md"
                onClick={onConfirmExit}
                className="flex-1 text-ink-muted hover:text-ink order-2 sm:order-1"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                <span>Exit</span>
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
