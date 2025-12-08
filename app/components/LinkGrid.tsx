"use client";

import { Link, Folder } from "@/types";
import { LinkCard } from "./LinkCard";
import { EmptyState } from "./EmptyState";

interface LinkGridProps {
  links: Link[];
  folders: Folder[];
  onDelete: (id: string) => void;
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
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="aspect-video bg-stone-200  rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (links.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {links.map((link) => (
        <LinkCard
          key={link.id}
          link={link}
          folders={folders}
          onDelete={onDelete}
          onMove={onMove}
        />
      ))}
    </div>
  );
}
