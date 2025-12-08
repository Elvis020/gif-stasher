"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-95",
          {
            "bg-violet-500 text-white hover:bg-violet-600 shadow-lg shadow-violet-500/25":
              variant === "primary",
            "bg-zinc-800 text-zinc-100 hover:bg-zinc-700":
              variant === "secondary",
            "bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800":
              variant === "ghost",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
          },
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
