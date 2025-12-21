"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/app/hooks/useTheme";

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={(e) => toggleTheme(e)}
      className={`relative p-2.5 rounded-xl border transition-all duration-300 active:scale-90 hover:scale-105 overflow-hidden group ${
        isDark
          ? "bg-stone-800 border-stone-700 hover:bg-stone-700 hover:border-amber-500/50"
          : "bg-stone-100 border-stone-200 hover:bg-stone-200 hover:border-amber-400/50"
      }`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Glow effect on hover */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          isDark
            ? "bg-gradient-to-br from-amber-500/20 to-orange-600/20"
            : "bg-gradient-to-br from-amber-300/30 to-orange-400/30"
        }`}
      />

      {/* Icon with rotation animation */}
      <div className="relative transition-transform duration-500 group-hover:rotate-12">
        {isDark ? (
          <Moon className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
        ) : (
          <Sun className="w-5 h-5 text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.4)]" />
        )}
      </div>
    </button>
  );
}
