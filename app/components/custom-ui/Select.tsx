"use client";

import { SelectHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";
import { useTheme } from "@/app/hooks/useTheme";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    const { isDark } = useTheme();

    // Different chevron colors for dark/light mode
    const chevronColor = isDark ? "%23a8a29e" : "%2378716c"; // stone-400 : stone-500

    return (
      <select
        ref={ref}
        className={clsx(
          "px-4 py-2.5 rounded-xl text-sm appearance-none cursor-pointer",
          "focus:outline-none focus:ring-2 focus:border-transparent",
          "transition-all duration-200",
          "bg-[length:20px] bg-[right_8px_center] bg-no-repeat pr-10",
          isDark
            ? "bg-stone-800 border border-stone-600 text-stone-100 focus:ring-amber-400"
            : "bg-white border border-stone-300 text-stone-800 focus:ring-amber-500",
          className,
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22${chevronColor}%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`,
        }}
        {...props}
      >
        {children}
      </select>
    );
  },
);

Select.displayName = "Select";
