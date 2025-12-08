"use client";

import { ExternalLink, Trash2, FolderInput } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { Link, Folder } from "@/types";

interface LinkCardProps {
  link: Link;
  folders: Folder[];
  onDelete: (id: string) => void;
  onMove: (linkId: string, folderId: string | null) => void;
}

export function LinkCard({ link, folders, onDelete, onMove }: LinkCardProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  // Extract tweet ID from URL for display
  const getTweetId = (url: string) => {
    const match = url.match(/status\/(\d+)/);
    return match ? match[1].slice(-8) : "tweet";
  };

  // Generate a placeholder gradient based on URL
  const getGradient = (url: string) => {
    const hash = url.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    const gradients = [
      "from-violet-600 to-indigo-600",
      "from-fuchsia-600 to-pink-600",
      "from-cyan-600 to-blue-600",
      "from-emerald-600 to-teal-600",
      "from-amber-600 to-orange-600",
      "from-rose-600 to-red-600",
    ];
    return gradients[hash % gradients.length];
  };

  return (
    <div className="group relative bg-zinc-800/50 border border-zinc-700/50 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all duration-200">
      {/* Placeholder preview */}
      <div
        className={clsx(
          "aspect-video bg-gradient-to-br flex items-center justify-center",
          getGradient(link.url),
        )}
      >
        <span className="text-white/30 text-4xl font-bold">GIF</span>
      </div>

      {/* Card content */}
      <div className="p-3">
        <p className="text-xs text-zinc-500 truncate font-mono">
          ...{getTweetId(link.url)}
        </p>
      </div>

      {/* Hover actions */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
          title="Open tweet"
        >
          <ExternalLink size={20} />
        </a>

        <div className="relative">
          <button
            onClick={() => setShowMoveMenu(!showMoveMenu)}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
            title="Move to folder"
          >
            <FolderInput size={20} />
          </button>

          {showMoveMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMoveMenu(false)}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 py-1 min-w-[140px]">
                <button
                  onClick={() => {
                    onMove(link.id, null);
                    setShowMoveMenu(false);
                  }}
                  className={clsx(
                    "w-full px-3 py-2 text-sm text-left hover:bg-zinc-700 transition-colors",
                    !link.folder_id ? "text-violet-400" : "text-zinc-300",
                  )}
                >
                  No folder
                </button>
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => {
                      onMove(link.id, folder.id);
                      setShowMoveMenu(false);
                    }}
                    className={clsx(
                      "w-full px-3 py-2 text-sm text-left hover:bg-zinc-700 transition-colors",
                      link.folder_id === folder.id
                        ? "text-violet-400"
                        : "text-zinc-300",
                    )}
                  >
                    {folder.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => onDelete(link.id)}
          className="p-2.5 bg-white/10 hover:bg-red-500/50 rounded-xl text-white transition-colors"
          title="Delete"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}
