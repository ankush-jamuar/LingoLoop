"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Logo } from "@/components/branding/Logo";
import { Button } from "@/components/ui/Button";
import { getHealthStatus } from "@/lib/api/health";
import { ArrowRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [apiStatus, setApiStatus] = useState<
    "checking" | "connected" | "offline"
  >("checking");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkStatus = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    }
    try {
      const res = await getHealthStatus();
      if (res.status === "ok") {
        setApiStatus("connected");
      } else {
        setApiStatus("offline");
      }
    } catch {
      setApiStatus("offline");
    } finally {
      if (isManual) {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    getHealthStatus()
      .then((res) => {
        if (!ignore) {
          setApiStatus(res.status === "ok" ? "connected" : "offline");
        }
      })
      .catch(() => {
        if (!ignore) {
          setApiStatus("offline");
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ink/10 bg-cream/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 h-16 sm:h-20">
        {/* Brand Wordmark */}
        <Logo size="md" />

        {/* Right Section: Lightweight API Pill & Action */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Lightweight API status indicator */}
          <button
            onClick={() => checkStatus(true)}
            disabled={isRefreshing}
            title="Click to re-check backend health"
            className={cn(
              "hidden sm:inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold font-display transition-colors cursor-pointer",
              apiStatus === "connected"
                ? "bg-mint/80 border-mint-dark/20 text-mint-dark hover:bg-mint"
                : apiStatus === "checking"
                ? "bg-sun-subtle border-sun/30 text-ink-muted"
                : "bg-coral-subtle border-coral/30 text-coral hover:bg-coral-subtle/80"
            )}
          >
            {apiStatus === "connected" ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aqua opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-aqua"></span>
                </span>
                <span>API Connected</span>
              </>
            ) : apiStatus === "checking" ? (
              <>
                <RefreshCw className={cn("h-3 w-3 text-sun", isRefreshing && "animate-spin")} />
                <span>Checking API...</span>
              </>
            ) : (
              <>
                <span className="inline-flex h-2 w-2 rounded-full bg-coral"></span>
                <span>API Offline</span>
              </>
            )}
          </button>

          {/* Primary CTA */}
          <Button
            variant="coral"
            size="sm"
            onClick={() => {
              const previewEl = document.getElementById("loop-preview");
              previewEl?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span>Start learning</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
