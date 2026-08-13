import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "mint" | "coral" | "violet" | "sun" | "aqua" | "ink" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "mint",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    mint: "bg-mint text-mint-dark border-mint-dark/20",
    coral: "bg-coral-subtle text-coral border-coral/30",
    violet: "bg-violet-subtle text-violet border-violet/30",
    sun: "bg-sun-subtle text-ink border-sun/40",
    aqua: "bg-aqua-subtle text-aqua-hover border-aqua/30",
    ink: "bg-ink text-cream border-ink",
    outline: "bg-transparent text-ink border-ink/30",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2.5 py-0.5 font-bold",
    md: "text-xs px-3 py-1 font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-display uppercase tracking-wider",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
