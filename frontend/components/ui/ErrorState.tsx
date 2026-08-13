"use client";

import React from "react";
import { MiloMascot } from "@/components/branding/MiloMascot";
import { Button } from "@/components/ui/Button";
import { RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ErrorState({
  title = "Unable to connect to LingoLoop",
  message = "We could not reach the backend service to load your learning loop. Please ensure the backend server is running.",
  onRetry,
  isRetrying = false,
}: ErrorStateProps) {
  return (
    <div className="surface-card mx-auto max-w-lg rounded-3xl p-8 text-center space-y-6 my-12 border-2 border-coral/30">
      <div className="flex justify-center">
        <MiloMascot size="md" mood="curious" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-extrabold text-ink font-display tracking-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-body">
          {message}
        </p>
      </div>

      <div className="pt-2">
        <Button
          variant="coral"
          size="md"
          onClick={onRetry}
          disabled={isRetrying}
          className="w-full sm:w-auto"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isRetrying ? "animate-spin" : ""}`}
          />
          <span>{isRetrying ? "Reconnecting..." : "Retry Connection"}</span>
        </Button>
      </div>
    </div>
  );
}
