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
      "from-amber-500 to-orange-600",
      "from-orange-500 to-red-500",
      "from-rose-500 to-pink-600",
      "from-teal-500 to-emerald-600",
      "from-cyan-500 to-blue-500",
      "from-stone-500 to-stone-700",
    ];
    return gradients[hash % gradients.length];
  };

  return (
    <div className="group relative bg-stone-100 /50 border border-stone-200  rounded-xl overflow-hidden hover:border-stone-300 transition-all duration-200">
      {/* Placeholder preview */}
      <div
        className={clsx(
          "aspect-video bg-gradient-to-br flex items-center justify-center",
          getGradient(link.url),
        )}
      >
        <span className="text-white/30 text-xl sm:text-2xl font-bold">GIF</span>
      </div>

      {/* Card content */}
      <div className="p-2">
        <p className="text-[10px] sm:text-xs text-stone-500 truncate font-mono">
          ...{getTweetId(link.url)}
        </p>
      </div>

      {/* Hover actions */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1 sm:gap-2">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          title="Open tweet"
        >
          <ExternalLink size={16} className="sm:w-[18px] sm:h-[18px]" />
        </a>

        <div className="relative">
          <button
            onClick={() => setShowMoveMenu(!showMoveMenu)}
            className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            title="Move to folder"
          >
            <FolderInput size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>

          {showMoveMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMoveMenu(false)}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white  border border-stone-200 rounded-lg shadow-xl z-20 py-1 min-w-[120px]">
                <button
                  onClick={() => {
                    onMove(link.id, null);
                    setShowMoveMenu(false);
                  }}
                  className={clsx(
                    "w-full px-3 py-1.5 text-xs sm:text-sm text-left hover:bg-stone-100  transition-colors",
                    !link.folder_id ? "text-amber-600 " : "text-stone-700",
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
                      "w-full px-3 py-1.5 text-xs sm:text-sm text-left hover:bg-stone-100  transition-colors",
                      link.folder_id === folder.id
                        ? "text-amber-600 "
                        : "text-stone-700",
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
          className="p-1.5 sm:p-2 bg-white/10 hover:bg-red-500/50 rounded-lg text-white transition-colors"
          title="Delete"
        >
          <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>
    </div>
  );
}
