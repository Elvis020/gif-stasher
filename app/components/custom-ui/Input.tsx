"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";
import { useTheme } from "@/app/hooks/useTheme";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  _brand?: never;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const { isDark } = useTheme();

    return (
      <input
        ref={ref}
        className={clsx(
          "w-full px-4 py-2.5 rounded-xl text-base sm:text-sm",
          "focus:outline-none focus:ring-2 focus:border-transparent",
          "transition-all duration-200",
          isDark
            ? "bg-stone-800 border border-stone-600 text-stone-100 placeholder:text-stone-500 focus:ring-amber-400"
            : "bg-white border border-stone-300 text-stone-800 placeholder:text-stone-400 focus:ring-amber-500",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
