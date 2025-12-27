"use client";

import { motion } from "framer-motion";
import { Link, Folder } from "@/types";
import { useTheme } from "@/app/hooks/useTheme";
import { Sparkles, Clock } from "lucide-react";
import { useState, useRef } from "react";
import { clsx } from "clsx";

interface GalleryFolderCardProps {
  folder: { id: string; name: string; isUnsorted?: boolean };
  links: Link[];
  onClick: () => void;
  index: number;
}

export function GalleryFolderCard({
  folder,
  links,
  onClick,
  index,
}: GalleryFolderCardProps) {
  const { isDark } = useTheme();
  const [isHovering, setIsHovering] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Get 4 most recent links with thumbnails for the preview grid
  const previewLinks = links
    .filter((l) => l.thumbnail || l.video_url)
    .slice(0, 4);

  // Calculate "freshness" - how recently updated
  const mostRecentLink = links[0];
  const lastUpdated = mostRecentLink
    ? new Date(mostRecentLink.created_at)
    : null;
  const now = new Date();
  const hoursSinceUpdate = lastUpdated
    ? (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60)
    : Infinity;
  const isHot = hoursSinceUpdate < 24; // Updated within 24 hours
  const isWarm = hoursSinceUpdate < 72; // Updated within 3 days

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Staggered animation delay based on index
  const staggerDelay = index * 0.08;

  // Generate a unique gradient based on folder name
  const getGradient = (name: string) => {
    const hash = name.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    const gradients = [
      "from-amber-400 via-orange-500 to-rose-500",
      "from-emerald-400 via-teal-500 to-cyan-500",
      "from-violet-400 via-purple-500 to-fuchsia-500",
      "from-rose-400 via-pink-500 to-red-500",
      "from-sky-400 via-blue-500 to-indigo-500",
      "from-lime-400 via-green-500 to-emerald-500",
    ];
    return gradients[hash % gradients.length];
  };

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={clsx(
        "relative w-full aspect-square rounded-2xl overflow-hidden",
        "transition-all duration-300 ease-out",
        "outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2",
        isDark ? "focus-visible:ring-offset-stone-900" : "focus-visible:ring-offset-amber-50"
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: staggerDelay,
        ease: [0.23, 1, 0.32, 1],
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background - either thumbnail grid or gradient */}
      {previewLinks.length > 0 ? (
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5">
          {previewLinks.map((link, i) => (
            <div key={link.id} className="relative overflow-hidden">
              {isHovering && link.video_url ? (
                <video
                  ref={(el) => { videoRefs.current[i] = el; }}
                  src={link.video_url}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : link.thumbnail ? (
                <img
                  src={link.thumbnail}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-500"
                  style={{
                    transform: isHovering ? "scale(1.1)" : "scale(1)",
                  }}
                />
              ) : (
                <div
                  className={clsx(
                    "w-full h-full bg-gradient-to-br",
                    getGradient(folder.name)
                  )}
                />
              )}
            </div>
          ))}
          {/* Fill empty slots with gradient */}
          {[...Array(4 - previewLinks.length)].map((_, i) => (
            <div
              key={`empty-${i}`}
              className={clsx(
                "w-full h-full bg-gradient-to-br opacity-60",
                getGradient(folder.name)
              )}
            />
          ))}
        </div>
      ) : (
        // Empty folder - show beautiful gradient with illustration
        <div
          className={clsx(
            "absolute inset-0 bg-gradient-to-br",
            getGradient(folder.name)
          )}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/30">
              <svg
                className="w-16 h-16 sm:w-20 sm:h-20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Overlay gradient for text readability */}
      <div
        className={clsx(
          "absolute inset-0 transition-opacity duration-300",
          isHovering
            ? "bg-gradient-to-t from-black/80 via-black/40 to-transparent"
            : "bg-gradient-to-t from-black/70 via-black/20 to-transparent"
        )}
      />

      {/* Hot/Fresh badge */}
      {isHot && links.length > 0 && (
        <motion.div
          className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold shadow-lg"
          initial={{ scale: 0, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: staggerDelay + 0.3, type: "spring" }}
        >
          <Sparkles className="w-3 h-3" />
          <span className="hidden sm:inline">Hot</span>
        </motion.div>
      )}

      {/* Folder info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <motion.h3
          className="text-white font-bold text-lg sm:text-xl leading-tight truncate drop-shadow-lg"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: staggerDelay + 0.1 }}
        >
          {folder.name}
        </motion.h3>

        <motion.div
          className="flex items-center justify-between mt-1"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: staggerDelay + 0.2 }}
        >
          <span className="text-white/80 text-sm font-medium">
            {links.length} {links.length === 1 ? "GIF" : "GIFs"}
          </span>

          {lastUpdated && (
            <span className="flex items-center gap-1 text-white/60 text-xs">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(lastUpdated)}
            </span>
          )}
        </motion.div>
      </div>

      {/* Subtle border on hover */}
      <motion.div
        className={clsx(
          "absolute inset-0 rounded-2xl pointer-events-none",
          "border-2 transition-colors duration-300",
          isHovering
            ? "border-white/40"
            : isDark
              ? "border-white/10"
              : "border-black/5"
        )}
      />
    </motion.button>
  );
}
