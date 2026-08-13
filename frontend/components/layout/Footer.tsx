import React from "react";
import { Logo } from "@/components/branding/Logo";

export function Footer() {
  return (
    <footer className="w-full border-t border-ink/10 bg-cream-muted/50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center sm:items-start gap-2">
          <Logo size="sm" />
          <p className="text-xs text-ink-muted">
            Learn. Loop. Level up. — An original language-learning experience.
          </p>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-1 text-xs text-ink-subtle">
          <span className="font-display font-semibold">
            Learn → Practice → Recall → Earn → Repeat
          </span>
          <span>Phase 1 • Project Foundation</span>
        </div>
      </div>
    </footer>
  );
}
