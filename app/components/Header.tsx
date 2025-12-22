"use client";

import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { useTheme } from "@/app/hooks/useTheme";

export function Header() {
  const { isDark } = useTheme();

  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div
          className={`p-2.5 rounded-xl shadow-lg ${
            isDark
              ? "bg-gradient-to-br from-amber-600 to-orange-700 shadow-amber-600/20"
              : "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/25"
          }`}
        >
          <Image
            src="/gif_stash.png"
            alt="GIF Stash"
            width={24}
            height={24}
            className="w-6 h-6 rounded-md"
          />
        </div>
        <div>
          <h1
            className={`text-2xl font-bold ${isDark ? "text-stone-100" : "text-stone-800"}`}
          >
            GIF Stash
          </h1>
          <p
            className={`text-sm ${isDark ? "text-stone-400" : "text-stone-500"}`}
          >
            Your meme arsenal
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <UserMenu />
        <ThemeToggle />
      </div>
    </header>
  );
}
