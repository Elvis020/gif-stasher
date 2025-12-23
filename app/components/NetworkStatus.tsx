"use client";

import { WifiOff, Wifi } from "lucide-react";
import { useNetworkStatus } from "@/app/hooks/useNetworkStatus";
import { useTheme } from "@/app/hooks/useTheme";
import { clsx } from "clsx";

export function NetworkStatus() {
  const { isOnline, wasOffline } = useNetworkStatus();
  const { isDark } = useTheme();

  // Don't show anything if we're online and haven't been offline
  if (isOnline && !wasOffline) return null;

  return (
    <div
      className={clsx(
        "fixed top-4 right-4 z-50 px-4 py-2 rounded-xl shadow-lg",
        "flex items-center gap-2 text-sm font-medium transition-all",
        isOnline
          ? isDark
            ? "bg-green-900/90 text-green-200 border border-green-700"
            : "bg-green-100/90 text-green-800 border border-green-300"
          : isDark
            ? "bg-orange-900/90 text-orange-200 border border-orange-700"
            : "bg-orange-100/90 text-orange-800 border border-orange-300"
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Back online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Offline - changes will sync when reconnected</span>
        </>
      )}
    </div>
  );
}
