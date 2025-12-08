"use client";

import { Ghost } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-zinc-800/50 rounded-2xl mb-4">
        <Ghost className="w-12 h-12 text-zinc-600" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-400 mb-1">No GIFs yet</h3>
      <p className="text-sm text-zinc-600 max-w-60">
        Paste a Twitter/X URL above to start building your meme arsenal
      </p>
    </div>
  );
}
