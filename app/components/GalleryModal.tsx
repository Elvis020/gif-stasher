"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft } from "lucide-react";
import { Link, Folder } from "@/types";
import { LinkGrid } from "./LinkGrid";
import { useTheme } from "@/app/hooks/useTheme";
import { clsx } from "clsx";
import { useEffect } from "react";

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: { id: string; name: string } | null;
  links: Link[];
  allFolders: Folder[];
  onDeleteLink: (id: string) => Promise<void>;
  onMoveLink: (linkId: string, folderId: string | null) => void;
}

export function GalleryModal({
  isOpen,
  onClose,
  folder,
  links,
  allFolders,
  onDeleteLink,
  onMoveLink,
}: GalleryModalProps) {
  const { isDark } = useTheme();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && folder && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className={clsx(
              "fixed inset-0 z-50 flex items-end sm:items-center justify-center",
              "pointer-events-none"
            )}
          >
            <motion.div
              className={clsx(
                "pointer-events-auto",
                "w-full sm:w-[90vw] sm:max-w-4xl",
                "h-[85vh] sm:h-[80vh] sm:max-h-[800px]",
                "rounded-t-3xl sm:rounded-3xl overflow-hidden",
                "flex flex-col",
                isDark ? "bg-stone-900" : "bg-amber-50"
              )}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className={clsx(
                  "flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5",
                  "border-b",
                  isDark ? "border-stone-800" : "border-stone-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className={clsx(
                      "p-2 -ml-2 rounded-xl transition-colors",
                      isDark
                        ? "hover:bg-stone-800 text-stone-400"
                        : "hover:bg-stone-100 text-stone-500"
                    )}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2
                      className={clsx(
                        "font-bold text-xl sm:text-2xl",
                        isDark ? "text-white" : "text-stone-800"
                      )}
                    >
                      {folder.name}
                    </h2>
                    <p
                      className={clsx(
                        "text-sm",
                        isDark ? "text-stone-500" : "text-stone-400"
                      )}
                    >
                      {links.length} {links.length === 1 ? "GIF" : "GIFs"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className={clsx(
                    "p-2 rounded-xl transition-colors hidden sm:flex",
                    isDark
                      ? "hover:bg-stone-800 text-stone-400"
                      : "hover:bg-stone-100 text-stone-500"
                  )}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <LinkGrid
                  links={links}
                  folders={allFolders}
                  onDelete={onDeleteLink}
                  onMove={onMoveLink}
                  autoPlayOnMobile={true}
                />
              </div>

              {/* Mobile swipe indicator */}
              <div className="sm:hidden flex justify-center py-2">
                <div
                  className={clsx(
                    "w-12 h-1 rounded-full",
                    isDark ? "bg-stone-700" : "bg-stone-300"
                  )}
                />
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
