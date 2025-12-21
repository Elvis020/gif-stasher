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
            "bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-600/25 ":
              variant === "primary",
            "bg-stone-200 text-stone-800 hover:bg-stone-300 ":
              variant === "secondary",
            "bg-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-200 ":
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
