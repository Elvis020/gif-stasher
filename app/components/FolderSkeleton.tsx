"use client";

import { useTheme } from "@/app/hooks/useTheme";
import { clsx } from "clsx";

export function FolderSkeleton() {
  const { isDark } = useTheme();

  return (
    <div className="space-y-4 animate-pulse mt-8">
      {/* Folder tabs skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={clsx(
              "h-10 rounded-xl flex-shrink-0",
              isDark ? "bg-stone-800/50" : "bg-white/50",
              i === 1 ? "w-32" : "w-24"
            )}
          />
        ))}
      </div>

      {/* Link cards skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={clsx(
              "flex items-center gap-3 p-2 rounded-xl",
              isDark
                ? "bg-stone-800/50 border border-stone-700/50"
                : "bg-white/50 border border-stone-200/50"
            )}
          >
            {/* Thumbnail skeleton */}
            <div
              className={clsx(
                "w-24 h-24 sm:w-32 sm:h-32 rounded-xl flex-shrink-0",
                isDark ? "bg-stone-700/50" : "bg-stone-200/50"
              )}
            />

            {/* Info skeleton */}
            <div className="flex-1 min-w-0 space-y-2">
              <div
                className={clsx(
                  "h-4 rounded w-3/4",
                  isDark ? "bg-stone-700/50" : "bg-stone-200/50"
                )}
              />
              <div
                className={clsx(
                  "h-3 rounded w-1/2",
                  isDark ? "bg-stone-700/50" : "bg-stone-200/50"
                )}
              />
            </div>

            {/* Actions skeleton */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className={clsx(
                    "w-10 h-10 rounded-xl",
                    isDark ? "bg-stone-700/50" : "bg-stone-200/50"
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
