"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Link, Folder } from "@/types";
import { LinkCard } from "./LinkCard";
import { EmptyState } from "./EmptyState";

interface LinkGridProps {
  links: Link[];
  folders: Folder[];
  onDelete: (id: string) => Promise<void>;
  onMove: (linkId: string, folderId: string | null) => void;
  isLoading?: boolean;
}

export function LinkGrid({
  links,
  folders,
  onDelete,
  onMove,
  isLoading,
}: LinkGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-24 bg-stone-200 dark:bg-stone-700 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (links.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {links.map((link) => (
          <motion.div
            key={link.id}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              x: -20,
              transition: { duration: 0.2 },
            }}
            transition={{
              layout: { type: "spring", stiffness: 500, damping: 35 },
              opacity: { duration: 0.2 },
            }}
          >
            <LinkCard
              link={link}
              folders={folders}
              onDelete={onDelete}
              onMove={onMove}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
