"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  _brand?: never;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          "w-full px-4 py-2.5 rounded-xl text-sm",
          "bg-zinc-800 border border-zinc-700 text-zinc-100",
          "placeholder:text-zinc-500",
          "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent",
          "transition-all duration-200",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
