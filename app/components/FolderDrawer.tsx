"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Folder, Link } from "@/types";
import { LinkGrid } from "./LinkGrid";
import { clsx } from "clsx";
import { useTheme } from "@/app/hooks/useTheme";

interface FolderDrawerProps {
  folders: Folder[];
  links: Link[];
  onDeleteLink: (id: string) => Promise<void>;
  onMoveLink: (linkId: string, folderId: string | null) => void;
  onNewFolder: () => void;
  onEditFolder: (folder: Folder) => void;
  onDeleteFolder: (folderId: string) => void;
  linkCounts: Record<string, number>;
  openFolderId: string | null;
  onOpenFolderChange: (folderId: string | null) => void;
}

export function FolderDrawer({
  folders,
  links,
  onDeleteLink,
  onMoveLink,
  onNewFolder,
  onEditFolder,
  onDeleteFolder,
  linkCounts,
  openFolderId,
  onOpenFolderChange,
}: FolderDrawerProps) {
  const { isDark } = useTheme();

  const toggleFolder = (folderId: string) => {
    onOpenFolderChange(openFolderId === folderId ? null : folderId);
  };

  const getLinksForFolder = (folderId: string) => {
    if (folderId === "unsorted") return links.filter((l) => !l.folder_id);
    return links.filter((l) => l.folder_id === folderId);
  };

  const folderItems = [
    { id: "unsorted", name: "Unsorted", count: linkCounts["unsorted"] || 0 },
    ...folders.map((f) => ({ id: f.id, name: f.name, count: linkCounts[f.id] || 0, folder: f })),
  ] as Array<{ id: string; name: string; count: number; folder?: Folder }>;

  return (
    <div className="space-y-3">
      {folderItems.map((item) => {
        const isOpen = openFolderId === item.id;
        const folderLinks = getLinksForFolder(item.id);
        const isCustomFolder = item.folder !== undefined;

        return (
          <motion.div
            key={item.id}
            layout
            className="overflow-hidden"
          >
            {/* Folder Tab */}
            <motion.button
              onClick={() => toggleFolder(item.id)}
              onContextMenu={(e) => {
                if (isCustomFolder) {
                  e.preventDefault();
                  onEditFolder(item.folder!);
                }
              }}
              className={clsx(
                "w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-transparent",
                isOpen
                  ? isDark
                    ? "bg-amber-600 text-white rounded-b-none"
                    : "bg-amber-500 text-white rounded-b-none"
                  : isDark
                    ? "bg-stone-800 text-stone-200 hover:bg-stone-700 border border-stone-700"
                    : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
              )}
              whileTap={{ scale: 0.995 }}
            >
              <div className="flex items-center gap-3">
                {/* Folder Icon */}
                <motion.div
                  className={clsx(
                    "w-10 h-8 rounded-t-lg rounded-b-md relative",
                    isOpen
                      ? "bg-amber-400"
                      : isDark
                        ? "bg-amber-900/50"
                        : "bg-amber-100"
                  )}
                  animate={{ rotateX: isOpen ? 45 : 0 }}
                  style={{ transformOrigin: "bottom" }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={clsx(
                      "absolute -top-1.5 left-0 w-4 h-2 rounded-t-md",
                      isOpen
                        ? "bg-amber-400"
                        : isDark
                          ? "bg-amber-800/50"
                          : "bg-amber-200"
                    )}
                  />
                </motion.div>
                <span className="font-medium text-lg">{item.name}</span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={clsx(
                    "text-sm font-medium px-2.5 py-1 rounded-full",
                    isOpen
                      ? "bg-white/20"
                      : isDark
                        ? "bg-stone-700 text-stone-400"
                        : "bg-stone-100 text-stone-500"
                  )}
                >
                  {item.count}
                </span>
                <motion.div
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus
                    className={`w-5 h-5 ${
                      isOpen
                        ? "text-white"
                        : isDark
                          ? "text-stone-500"
                          : "text-stone-400"
                    }`}
                  />
                </motion.div>
              </div>
            </motion.button>

            {/* Folder Content */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div
                    className={`border border-t-0 rounded-b-2xl p-4 sm:p-6 max-h-[70vh] overflow-y-auto ${
                      isDark
                        ? "bg-stone-800 border-stone-700"
                        : "bg-white border-stone-200"
                    }`}
                  >
                    {/* Header with actions */}
                    {isCustomFolder && (
                      <div className="flex justify-end gap-2 mb-4">
                        <button
                          onClick={() => onEditFolder(item.folder!)}
                          className={`text-xs transition-colors ${
                            isDark
                              ? "text-stone-500 hover:text-stone-300"
                              : "text-stone-400 hover:text-stone-600"
                          }`}
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => {
                            onDeleteFolder(item.id);
                            onOpenFolderChange(null);
                          }}
                          className={`text-xs transition-colors ${
                            isDark
                              ? "text-red-400 hover:text-red-400"
                              : "text-red-400 hover:text-red-600"
                          }`}
                        >
                          Delete folder
                        </button>
                      </div>
                    )}

                    {/* GIF List */}
                    <LinkGrid
                      links={folderLinks}
                      folders={folders}
                      onDelete={onDeleteLink}
                      onMove={onMoveLink}
                      autoPlayOnMobile={true}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Add Folder Button */}
      <motion.button
        onClick={onNewFolder}
        className={`w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl border-2 border-dashed transition-all duration-200 ${
          isDark
            ? "border-stone-600 text-stone-500 hover:border-amber-500 hover:text-amber-400"
            : "border-stone-300 text-stone-400 hover:border-amber-400 hover:text-amber-500"
        }`}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">New Folder</span>
      </motion.button>
    </div>
  );
}
