"use client";

import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center gap-3 mb-8">
      <div className="p-2.5 bg-linear-to-br from-violet-500 to-fuchsia-500 rounded-xl shadow-lg shadow-violet-500/25">
        <Sparkles className="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">GIF Stash</h1>
        <p className="text-sm text-zinc-500">Your meme arsenal</p>
      </div>
    </header>
  );
}
