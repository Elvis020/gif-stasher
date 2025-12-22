"use client";

import { LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { useTheme } from "@/app/hooks/useTheme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function UserMenu() {
  const { user, isAnonymous, signInWithGoogle, signOut, isLoading } = useAuth();
  const { isDark } = useTheme();
  const queryClient = useQueryClient();

  if (isLoading) return null;

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error("Failed to sign in. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Clear all React Query cache
      queryClient.clear();
      // Clear migration flag to prevent accidental migrations
      localStorage.removeItem('gif-stash-pending-migration-user-id');
      // Reload the page to reset everything
      window.location.reload();
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  // For anonymous users, show Sign In button
  if (isAnonymous) {
    return (
      <button
        onClick={handleSignIn}
        className={`relative p-2.5 px-4 rounded-xl border transition-all duration-300 active:scale-90 hover:scale-105 overflow-hidden group flex items-center gap-2 ${
          isDark
            ? "bg-stone-800 border-stone-700 hover:bg-stone-700 hover:border-amber-500/50"
            : "bg-stone-100 border-stone-200 hover:bg-stone-200 hover:border-amber-400/50"
        }`}
      >
        {/* Glow effect on hover */}
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            isDark
              ? "bg-gradient-to-br from-amber-500/20 to-orange-600/20"
              : "bg-gradient-to-br from-amber-300/30 to-orange-400/30"
          }`}
        />

        <LogIn className={`w-4 h-4 relative ${isDark ? "text-amber-400" : "text-amber-600"}`} />
        <span className={`text-sm font-medium relative ${isDark ? "text-stone-200" : "text-stone-700"}`}>
          Sign in
        </span>
      </button>
    );
  }

  // For signed-in users, show avatar/dropdown
  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName = user?.user_metadata?.full_name || user?.email || "User";
  const email = user?.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`relative p-1 rounded-xl border transition-all duration-300 active:scale-90 hover:scale-105 overflow-hidden group ${
            isDark
              ? "bg-stone-800 border-stone-700 hover:bg-stone-700 hover:border-amber-500/50"
              : "bg-stone-100 border-stone-200 hover:bg-stone-200 hover:border-amber-400/50"
          }`}
          aria-label="User menu"
        >
          {/* Glow effect on hover */}
          <div
            className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isDark
                ? "bg-gradient-to-br from-amber-500/20 to-orange-600/20"
                : "bg-gradient-to-br from-amber-300/30 to-orange-400/30"
            }`}
          />

          <div className="relative w-8 h-8 rounded-lg overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${
                isDark ? "bg-stone-700" : "bg-stone-300"
              }`}>
                <User className={`w-5 h-5 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
              </div>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className={`px-2 py-2 border-b ${isDark ? "border-stone-700" : "border-stone-200"}`}>
          <p className={`text-sm font-medium ${isDark ? "text-stone-200" : "text-stone-800"}`}>
            {displayName}
          </p>
          {email && (
            <p className={`text-xs ${isDark ? "text-stone-500" : "text-stone-500"}`}>
              {email}
            </p>
          )}
        </div>
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
