"use client";

import {
  Folder as FolderIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { Folder } from "@/types";

interface FolderTabsProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelect: (folderId: string | null) => void;
  onEdit: (folder: Folder) => void;
  onDelete: (folderId: string) => void;
  linkCounts: Record<string, number>;
}

export function FolderTabs({
  folders,
  selectedFolderId,
  onSelect,
  onEdit,
  onDelete,
  linkCounts,
}: FolderTabsProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const totalLinks = Object.values(linkCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {/* All tab */}
        <button
          onClick={() => onSelect(null)}
          className={clsx(
            "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
            selectedFolderId === null
              ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
              : "bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700",
          )}
        >
          <FolderIcon size={16} />
          <span>All</span>
          <span
            className={clsx(
              "px-1.5 py-0.5 rounded-md text-xs",
              selectedFolderId === null ? "bg-violet-400/30" : "bg-zinc-700",
            )}
          >
            {totalLinks}
          </span>
        </button>

        {/* Folder tabs */}
        {folders.map((folder) => (
          <div key={folder.id} className="relative">
            <button
              onClick={() => onSelect(folder.id)}
              className={clsx(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                selectedFolderId === folder.id
                  ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700",
              )}
            >
              <FolderIcon size={16} />
              <span>{folder.name}</span>
              <span
                className={clsx(
                  "px-1.5 py-0.5 rounded-md text-xs",
                  selectedFolderId === folder.id
                    ? "bg-violet-400/30"
                    : "bg-zinc-700",
                )}
              >
                {linkCounts[folder.id] || 0}
              </span>

              {/* Menu trigger */}
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === folder.id ? null : folder.id);
                }}
                className={clsx(
                  "p-0.5 rounded hover:bg-white/10",
                  selectedFolderId === folder.id
                    ? "text-white/70"
                    : "text-zinc-500",
                )}
              >
                <MoreHorizontal size={14} />
              </span>
            </button>

            {/* Dropdown menu */}
            {openMenuId === folder.id && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpenMenuId(null)}
                />
                <div className="absolute top-full right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 py-1 min-w-[120px]">
                  <button
                    onClick={() => {
                      onEdit(folder);
                      setOpenMenuId(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
                  >
                    <Pencil size={14} />
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      onDelete(folder.id);
                      setOpenMenuId(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-zinc-700 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
