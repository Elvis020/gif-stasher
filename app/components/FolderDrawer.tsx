"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { Folder, Link } from "@/types";
import { LinkCard } from "./LinkCard";
import { clsx } from "clsx";

interface FolderDrawerProps {
  folders: Folder[];
  links: Link[];
  onDeleteLink: (id: string) => Promise<void>;
  onMoveLink: (linkId: string, folderId: string | null) => void;
  onNewFolder: () => void;
  onEditFolder: (folder: Folder) => void;
  onDeleteFolder: (folderId: string) => void;
  linkCounts: Record<string, number>;
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
}: FolderDrawerProps) {
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);

  const toggleFolder = (folderId: string) => {
    setOpenFolderId(openFolderId === folderId ? null : folderId);
  };

  const getLinksForFolder = (folderId: string) => {
    if (folderId === "all") return links;
    if (folderId === "unsorted") return links.filter((l) => !l.folder_id);
    return links.filter((l) => l.folder_id === folderId);
  };

  const folderItems = [
    { id: "all", name: "All", count: links.length },
    ...folders.map((f) => ({ id: f.id, name: f.name, count: linkCounts[f.id] || 0, folder: f })),
    { id: "unsorted", name: "Unsorted", count: linkCounts["unsorted"] || 0 },
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
                "w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200",
                isOpen
                  ? "bg-amber-500 text-white rounded-b-none"
                  : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
              )}
              whileTap={{ scale: 0.995 }}
            >
              <div className="flex items-center gap-3">
                {/* Folder Icon */}
                <motion.div
                  className={clsx(
                    "w-10 h-8 rounded-t-lg rounded-b-md relative",
                    isOpen ? "bg-amber-400" : "bg-amber-100"
                  )}
                  animate={{ rotateX: isOpen ? 45 : 0 }}
                  style={{ transformOrigin: "bottom" }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={clsx(
                      "absolute -top-1.5 left-0 w-4 h-2 rounded-t-md",
                      isOpen ? "bg-amber-400" : "bg-amber-200"
                    )}
                  />
                </motion.div>
                <span className="font-medium text-lg">{item.name}</span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={clsx(
                    "text-sm font-medium px-2.5 py-1 rounded-full",
                    isOpen ? "bg-white/20" : "bg-stone-100 text-stone-500"
                  )}
                >
                  {item.count}
                </span>
                <motion.div
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus
                    size={20}
                    className={isOpen ? "text-white" : "text-stone-400"}
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
                  <div className="bg-white border border-t-0 border-stone-200 rounded-b-2xl p-4 sm:p-6">
                    {/* Header with actions */}
                    {isCustomFolder && (
                      <div className="flex justify-end gap-2 mb-4">
                        <button
                          onClick={() => onEditFolder(item.folder!)}
                          className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => {
                            onDeleteFolder(item.id);
                            setOpenFolderId(null);
                          }}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          Delete folder
                        </button>
                      </div>
                    )}

                    {/* GIF Grid */}
                    {folderLinks.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-12 text-center text-stone-400"
                      >
                        <p className="text-lg">Empty</p>
                        <p className="text-sm mt-1">Add some GIFs to this folder</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5"
                        layout
                      >
                        <AnimatePresence mode="popLayout">
                          {folderLinks.map((link) => (
                            <motion.div
                              key={link.id}
                              layout
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{
                                opacity: 0,
                                scale: 0.8,
                                transition: { duration: 0.2 }
                              }}
                              transition={{
                                layout: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 },
                                scale: { duration: 0.2 }
                              }}
                            >
                              <LinkCard
                                link={link}
                                folders={folders}
                                onDelete={onDeleteLink}
                                onMove={onMoveLink}
                              />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    )}
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
        className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl border-2 border-dashed border-stone-300 text-stone-400 hover:border-amber-400 hover:text-amber-500 transition-all duration-200"
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
      >
        <Plus size={20} />
        <span className="font-medium">New Folder</span>
      </motion.button>
    </div>
  );
}
