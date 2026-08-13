"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "coral" | "violet" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "coral",
      size = "md",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold font-display rounded-xl transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet disabled:opacity-50 disabled:pointer-events-none";

    const variantStyles = {
      coral:
        "bg-coral text-white border-2 border-ink shadow-[0_3px_0_0_#18202A] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-none hover:bg-coral-hover",
      violet:
        "bg-violet text-white border-2 border-ink shadow-[0_3px_0_0_#18202A] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-none hover:bg-violet-hover",
      outline:
        "bg-white text-ink border-2 border-ink shadow-[0_3px_0_0_#18202A] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-none hover:bg-cream-tint",
      ghost:
        "bg-transparent text-ink hover:bg-cream-muted active:bg-cream-tint",
    };

    const sizeStyles = {
      sm: "text-xs px-3.5 py-1.5 gap-1.5",
      md: "text-sm px-5 py-2.5 gap-2",
      lg: "text-base px-7 py-3.5 gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
