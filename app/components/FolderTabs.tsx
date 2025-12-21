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
              ? "bg-amber-600  text-white shadow-lg shadow-amber-600/25 "
              : "bg-stone-200  text-stone-600  hover:text-stone-800 hover:bg-stone-300 ",
          )}
        >
          <FolderIcon className="w-4 h-4" />
          <span>All</span>
          <span
            className={clsx(
              "px-1.5 py-0.5 rounded-md text-xs",
              selectedFolderId === null ? "bg-amber-500/30" : "bg-stone-300 ",
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
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/25 "
                  : "bg-stone-200  text-stone-600  hover:text-stone-800 hover:bg-stone-300 ",
              )}
            >
              <FolderIcon className="w-4 h-4" />
              <span>{folder.name}</span>
              <span
                className={clsx(
                  "px-1.5 py-0.5 rounded-md text-xs",
                  selectedFolderId === folder.id
                    ? "bg-amber-500/30"
                    : "bg-stone-300",
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
                  "p-0.5 rounded hover:bg-black/10",
                  selectedFolderId === folder.id
                    ? "text-white/70"
                    : "text-stone-400",
                )}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </span>
            </button>

            {/* Dropdown menu */}
            {openMenuId === folder.id && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpenMenuId(null)}
                />
                <div className="absolute top-full right-0 mt-1 bg-white  border border-stone-200 rounded-lg shadow-xl z-20 py-1 min-w-[120px]">
                  <button
                    onClick={() => {
                      onEdit(folder);
                      setOpenMenuId(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100  transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      onDelete(folder.id);
                      setOpenMenuId(null);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600  hover:bg-stone-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
