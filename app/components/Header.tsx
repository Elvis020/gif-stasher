"use client";

import { Sparkles } from "lucide-react";
// import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-linear-to-br from-amber-600 to-orange-700 rounded-xl shadow-lg shadow-amber-600/25 ">
          <Sparkles className="w-6 h-6 text-amber-50" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">GIF Stash</h1>
          <p className="text-sm text-stone-500 ">Your meme arsenal</p>
        </div>
      </div>

      {/*<ThemeToggle />*/}
    </header>
  );
}
