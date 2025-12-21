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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="aspect-[15/16] lg:aspect-[10/11] bg-stone-200 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (links.length === 0) {
    return <EmptyState />;
  }

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5"
      layout
    >
      <AnimatePresence mode="popLayout">
        {links.map((link) => (
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
              onDelete={onDelete}
              onMove={onMove}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
