"use client";

import {
  ExternalLink,
  Trash2,
  FolderInput,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  Download,
  MoreHorizontal,
  Clipboard,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import { Link, Folder } from "@/types";
import { useRetryVideo } from "@/app/hooks/useSupabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/app/components/ui/dropdown-menu";

interface LinkCardProps {
  link: Link;
  folders: Folder[];
  onDelete: (id: string) => Promise<void>;
  onMove: (linkId: string, folderId: string | null) => void;
}

export function LinkCard({ link, folders, onDelete, onMove }: LinkCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showReadyIndicator, setShowReadyIndicator] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevVideoUrl = useRef(link.video_url);

  const retryVideo = useRetryVideo();

  // Show ready indicator briefly when video transitions from null to uploaded
  useEffect(() => {
    // Only show if video_url was previously empty and now has a value
    if (!prevVideoUrl.current && link.video_url) {
      setShowReadyIndicator(true);
      const timer = setTimeout(() => setShowReadyIndicator(false), 3000);
      return () => clearTimeout(timer);
    }
    prevVideoUrl.current = link.video_url;
  }, [link.video_url]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(link.id);
    } catch (error) {
      console.error("Delete failed:", error);
      setIsDeleting(false);
    }
  };

  // Copy actual GIF image to clipboard
  const handleCopyImageToClipboard = useCallback(async () => {
    if (!link.video_url || isCopyingImage) return;

    setIsCopyingImage(true);
    try {
      const response = await fetch(link.video_url);
      const blob = await response.blob();

      // Try to copy as image - convert to PNG for better clipboard support
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = async () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0);

            canvas.toBlob(async (pngBlob) => {
              if (pngBlob) {
                await navigator.clipboard.write([
                  new ClipboardItem({ "image/png": pngBlob }),
                ]);
                setCopiedImage(true);
                setTimeout(() => setCopiedImage(false), 2000);
              }
              resolve();
            }, "image/png");
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
      });
    } catch (err) {
      console.error("Failed to copy image to clipboard:", err);
      // Fallback to copying URL
      await navigator.clipboard.writeText(link.video_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setIsCopyingImage(false);
    }
  }, [link.video_url, isCopyingImage]);

  // Download handler without event (for keyboard shortcut)
  const triggerDownload = useCallback(async () => {
    if (!link.video_url || isDownloading) return;

    setIsDownloading(true);
    try {
      const response = await fetch(link.video_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${link.id.slice(0, 8)}.gif`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  }, [link.video_url, link.id, isDownloading]);

  // Copy URL handler without event (for keyboard shortcut)
  const triggerCopyUrl = useCallback(async () => {
    const urlToCopy = link.video_url || link.url;
    await navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [link.video_url, link.url]);

  // Keyboard shortcuts when hovering
  useEffect(() => {
    if (!isHovering) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key.toLowerCase() === "c" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (e.shiftKey) {
          // Shift+C: Copy image to clipboard
          handleCopyImageToClipboard();
        } else {
          // C: Copy URL
          triggerCopyUrl();
        }
      } else if (e.key.toLowerCase() === "d" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        triggerDownload();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isHovering, handleCopyImageToClipboard, triggerCopyUrl, triggerDownload]);

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

  const handleCopyUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const urlToCopy = link.video_url || link.url;
    await navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRetry = async (e: React.MouseEvent) => {
    e.stopPropagation();
    retryVideo.mutate(link);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await triggerDownload();
  };

  const hasVideo = !!link.video_url;
  const isProcessing =
    link.video_status === "pending" || link.video_status === "downloading";
  const hasFailed = link.video_status === "failed";

  return (
    <div
      className={clsx(
        "group relative bg-stone-100 border border-stone-200 rounded-xl overflow-hidden transition-all duration-200",
        isDeleting
          ? "opacity-50 pointer-events-none"
          : "hover:border-stone-300",
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Video/Thumbnail Preview */}
      <div
        className={clsx(
          "aspect-video relative flex items-center justify-center transition-opacity",
          !link.thumbnail &&
            !hasVideo &&
            `bg-gradient-to-br ${getGradient(link.url)}`,
        )}
      >
        {/* Show video on hover if available */}
        {hasVideo && isHovering ? (
          <video
            ref={videoRef}
            src={link.video_url!}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : link.thumbnail ? (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${link.thumbnail})` }}
          />
        ) : (
          <span className="text-white/30 text-xl sm:text-2xl font-bold">
            GIF
          </span>
        )}

        {/* Video status overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <Loader2 className="animate-spin mx-auto mb-1" size={24} />
              <span className="text-xs">
                {link.video_status === "pending"
                  ? "Waiting..."
                  : "Downloading..."}
              </span>
            </div>
          </div>
        )}

        {/* Deletion overlay */}
        {isDeleting && (
          <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center z-10">
            <div className="text-center text-white">
              <Loader2 className="animate-spin mx-auto mb-1" size={24} />
              <span className="text-xs">Deleting...</span>
            </div>
          </div>
        )}

        {/* Failed status indicator */}
        {hasFailed && !isHovering && (
          <div
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
            title={link.video_error || "Failed"}
          >
            <AlertCircle size={14} />
          </div>
        )}

        {/* Video ready indicator - shows briefly then fades */}
        {showReadyIndicator && !isHovering && (
          <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
            <Check size={14} />
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="p-2 flex items-center justify-between">
        <p className="text-[10px] sm:text-xs text-stone-500 truncate font-mono">
          ...{getTweetId(link.url)}
        </p>
        {link.video_size && (
          <span className="text-[10px] text-stone-400">
            {(link.video_size / 1024 / 1024).toFixed(1)}MB
          </span>
        )}
      </div>

      {/* Hover actions - simplified with dropdown for secondary actions */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
        {/* Primary actions */}
        {hasVideo && (
          <>
            {/* Copy Image to Clipboard */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopyImageToClipboard();
              }}
              disabled={isCopyingImage}
              className="p-2 bg-white/10 hover:bg-purple-500/50 rounded-lg text-white transition-colors disabled:opacity-50"
              title={
                copiedImage
                  ? "Copied!"
                  : isCopyingImage
                    ? "Copying..."
                    : "Copy image (Shift+C)"
              }
            >
              {isCopyingImage ? (
                <Loader2 size={18} className="animate-spin" />
              ) : copiedImage ? (
                <Check size={18} className="text-green-400" />
              ) : (
                <Clipboard size={18} />
              )}
            </button>

            {/* Copy URL */}
            <button
              onClick={handleCopyUrl}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              title={copied ? "Copied!" : "Copy URL (C)"}
            >
              {copied ? (
                <Check size={18} className="text-green-400" />
              ) : (
                <Copy size={18} />
              )}
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="p-2 bg-white/10 hover:bg-green-500/50 rounded-lg text-white transition-colors disabled:opacity-50"
              title={isDownloading ? "Downloading..." : "Download (D)"}
            >
              {isDownloading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
            </button>
          </>
        )}

        {/* Copy URL when no video */}
        {!hasVideo && (
          <button
            onClick={handleCopyUrl}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            title={copied ? "Copied!" : "Copy tweet URL (C)"}
          >
            {copied ? (
              <Check size={18} className="text-green-400" />
            ) : (
              <Copy size={18} />
            )}
          </button>
        )}

        {/* More actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              title="More actions"
            >
              <MoreHorizontal size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-40">
            {/* Open tweet */}
            <DropdownMenuItem asChild>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink size={14} />
                Open tweet
              </a>
            </DropdownMenuItem>

            {/* Retry for failed */}
            {hasFailed && (
              <DropdownMenuItem
                onClick={handleRetry}
                disabled={retryVideo.isPending}
                className="flex items-center gap-2 cursor-pointer"
              >
                {retryVideo.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                Retry download
              </DropdownMenuItem>
            )}

            {/* Move to folder submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer">
                <FolderInput size={14} />
                Move to folder
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => onMove(link.id, null)}
                  className={clsx(
                    "cursor-pointer",
                    !link.folder_id && "text-amber-600",
                  )}
                >
                  No folder
                </DropdownMenuItem>
                {folders.map((folder) => (
                  <DropdownMenuItem
                    key={folder.id}
                    onClick={() => onMove(link.id, folder.id)}
                    className={clsx(
                      "cursor-pointer",
                      link.folder_id === folder.id && "text-amber-600",
                    )}
                  >
                    {folder.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            {/* Delete */}
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
            >
              {isDeleting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              {isDeleting ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
