"use client";

import { useState, useEffect } from "react";
import { X, Shield } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { useTheme } from "@/app/hooks/useTheme";
import { toast } from "sonner";

const BANNER_DISMISSED_KEY = "gif-stash-signin-banner-dismissed";

interface SignInBannerProps {
  linkCount: number;
}

export function SignInBanner({ linkCount }: SignInBannerProps) {
  const { isAnonymous, signInWithGoogle } = useAuth();
  const { isDark } = useTheme();
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to avoid flash

  useEffect(() => {
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    setIsDismissed(dismissed === "true");
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, "true");
    setIsDismissed(true);
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error("Failed to sign in. Please try again.");
    }
  };

  // Don't show if:
  // - Not anonymous (already signed in)
  // - Less than 3 GIFs
  // - Already dismissed
  if (!isAnonymous || linkCount < 3 || isDismissed) {
    return null;
  }

  return (
    <div
      className={`relative mb-6 p-4 rounded-xl border transition-all duration-300 ${
        isDark
          ? "bg-stone-800/50 border-amber-500/30 backdrop-blur-sm"
          : "bg-amber-50/80 border-amber-400/50 backdrop-blur-sm"
      }`}
    >
      <button
        onClick={handleDismiss}
        className={`absolute top-3 right-3 p-1 rounded-lg transition-colors ${
          isDark
            ? "text-stone-500 hover:text-stone-300 hover:bg-stone-700"
            : "text-stone-400 hover:text-stone-600 hover:bg-stone-200"
        }`}
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-4 pr-8">
        <div
          className={`p-2.5 rounded-xl flex-shrink-0 ${
            isDark
              ? "bg-gradient-to-br from-amber-600/20 to-orange-700/20"
              : "bg-gradient-to-br from-amber-500/20 to-orange-600/20"
          }`}
        >
          <Shield className={`w-5 h-5 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-base ${isDark ? "text-stone-100" : "text-stone-800"}`}>
            Keep your GIFs safe
          </p>
          <p className={`text-sm mt-1 ${isDark ? "text-stone-400" : "text-stone-600"}`}>
            Sign in with Google to access your stash from any device. All your GIFs will be preserved.
          </p>

          <button
            onClick={handleSignIn}
            className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 ${
              isDark
                ? "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20"
                : "bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-600/25"
            }`}
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
