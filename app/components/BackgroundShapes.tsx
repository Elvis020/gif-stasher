"use client";

import { useTheme } from "@/app/hooks/useTheme";

export function BackgroundShapes() {
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Large gradient circle - top right */}
      <div
        className={`absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl transition-colors duration-500 ${
          isDark
            ? "bg-amber-900/20"
            : "bg-amber-300/30"
        }`}
      />

      {/* Medium circle - bottom left */}
      <div
        className={`absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl transition-colors duration-500 ${
          isDark
            ? "bg-orange-900/15"
            : "bg-orange-200/40"
        }`}
      />

      {/* Small floating circle - top left */}
      <div
        className={`absolute top-1/4 left-1/6 w-32 h-32 rounded-full blur-2xl transition-colors duration-500 animate-float ${
          isDark
            ? "bg-amber-800/10"
            : "bg-amber-200/30"
        }`}
      />

      {/* Diagonal stripe accent - middle right */}
      <div
        className={`absolute top-1/3 -right-16 w-64 h-8 rotate-45 blur-xl transition-colors duration-500 ${
          isDark
            ? "bg-stone-700/30"
            : "bg-stone-300/40"
        }`}
      />

      {/* Small accent dot - center left */}
      <div
        className={`absolute top-1/2 left-8 w-16 h-16 rounded-full blur-xl transition-colors duration-500 animate-pulse-slow ${
          isDark
            ? "bg-amber-700/20"
            : "bg-amber-400/25"
        }`}
      />

      {/* Large soft blob - bottom right */}
      <div
        className={`absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-3xl transition-colors duration-500 ${
          isDark
            ? "bg-stone-800/40"
            : "bg-amber-100/50"
        }`}
      />

      {/* Thin horizontal accent line */}
      <div
        className={`absolute top-2/3 left-0 right-0 h-px transition-colors duration-500 ${
          isDark
            ? "bg-gradient-to-r from-transparent via-stone-700/20 to-transparent"
            : "bg-gradient-to-r from-transparent via-amber-300/30 to-transparent"
        }`}
      />
    </div>
  );
}
