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
  Play,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import { Link, Folder } from "@/types";
import { useRetryVideo } from "@/app/hooks/useSupabase";
import { useTheme } from "@/app/hooks/useTheme";
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
  const { isDark } = useTheme();
  const [isHovering, setIsHovering] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const retryVideo = useRetryVideo();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(link.id);
    } catch (error) {
      console.error("Delete failed:", error);
      setIsDeleting(false);
    }
  };

  const handleCopyImageToClipboard = useCallback(async () => {
    if (!link.video_url || isCopyingImage) return;

    setIsCopyingImage(true);
    try {
      const response = await fetch(link.video_url);
      const blob = await response.blob();
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
      await navigator.clipboard.writeText(link.video_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setIsCopyingImage(false);
    }
  }, [link.video_url, isCopyingImage]);

  const triggerDownload = useCallback(async () => {
    if (!link.video_url || isDownloading) return;

    setIsDownloading(true);
    try {
      const response = await fetch(link.video_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${link.id.slice(0, 8)}.mp4`;
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

  const handleCopyUrl = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const urlToCopy = link.video_url || link.url;
    await navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRetry = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    retryVideo.mutate(link);
  };

  // Keyboard shortcuts when hovering
  useEffect(() => {
    if (!isHovering) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key.toLowerCase() === "c" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (e.shiftKey) {
          handleCopyImageToClipboard();
        } else {
          handleCopyUrl();
        }
      } else if (e.key.toLowerCase() === "d" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        triggerDownload();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isHovering, handleCopyImageToClipboard, triggerDownload]);

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

  const hasVideo = !!link.video_url;
  const isProcessing = link.video_status === "pending" || link.video_status === "downloading";
  const hasFailed = link.video_status === "failed";

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
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

  return (
    <div
      className={clsx(
        "group flex items-center gap-3 p-2 rounded-xl",
        "transition-all duration-200",
        isDark
          ? "bg-stone-800/50 hover:bg-stone-800 border border-stone-700/50 hover:border-stone-600"
          : "bg-white/50 hover:bg-white border border-stone-200/50 hover:border-stone-300",
        isDeleting && "opacity-50 pointer-events-none"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setIsPlaying(false);
      }}
    >
      {/* Thumbnail */}
      <div
        className={clsx(
          "relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0",
          "flex items-center justify-center cursor-pointer",
          !link.thumbnail && !hasVideo && `bg-gradient-to-br ${getGradient(link.url)}`
        )}
        onClick={() => hasVideo && setIsPlaying(!isPlaying)}
      >
        {hasVideo && isPlaying ? (
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
          <>
            <img src={link.thumbnail} alt="" className="w-full h-full object-cover" />
            {hasVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
            )}
          </>
        ) : (
          <span className="text-white/50 text-sm font-bold">GIF</span>
        )}

        {/* Status indicators */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}
        {hasFailed && (
          <div className="absolute top-1 right-1 bg-red-500 rounded-full p-1">
            <AlertCircle className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={clsx(
          "text-sm font-medium truncate",
          isDark ? "text-stone-200" : "text-stone-700"
        )}>
          {hasVideo ? "Saved GIF" : isProcessing ? "Processing..." : hasFailed ? "Failed to save" : "Pending"}
        </p>
        <p className={clsx(
          "text-xs truncate",
          isDark ? "text-stone-500" : "text-stone-400"
        )}>
          {formatDate(link.created_at)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {hasVideo && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handleCopyImageToClipboard(); }}
              disabled={isCopyingImage}
              className={clsx(
                "p-2 rounded-lg transition-colors",
                isDark ? "hover:bg-stone-700 text-stone-400" : "hover:bg-stone-100 text-stone-500"
              )}
              title="Copy image"
            >
              {isCopyingImage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : copiedImage ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Clipboard className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); triggerDownload(); }}
              disabled={isDownloading}
              className={clsx(
                "p-2 rounded-lg transition-colors",
                isDark ? "hover:bg-stone-700 text-stone-400" : "hover:bg-stone-100 text-stone-500"
              )}
              title="Download"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>
          </>
        )}

        <button
          onClick={handleCopyUrl}
          className={clsx(
            "p-2 rounded-lg transition-colors",
            isDark ? "hover:bg-stone-700 text-stone-400" : "hover:bg-stone-100 text-stone-500"
          )}
          title="Copy URL"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={clsx(
                "p-2 rounded-lg transition-colors",
                isDark ? "hover:bg-stone-700 text-stone-400" : "hover:bg-stone-100 text-stone-500"
              )}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open tweet
              </a>
            </DropdownMenuItem>

            {hasFailed && (
              <DropdownMenuItem
                onClick={() => handleRetry()}
                disabled={retryVideo.isPending}
                className="flex items-center gap-2 cursor-pointer"
              >
                {retryVideo.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Retry download
              </DropdownMenuItem>
            )}

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer">
                <FolderInput className="w-3.5 h-3.5" />
                Move
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => onMove(link.id, null)}
                  className={clsx("cursor-pointer", !link.folder_id && "text-amber-600")}
                >
                  No folder
                </DropdownMenuItem>
                {folders.map((folder) => (
                  <DropdownMenuItem
                    key={folder.id}
                    onClick={() => onMove(link.id, folder.id)}
                    className={clsx("cursor-pointer", link.folder_id === folder.id && "text-amber-600")}
                  >
                    {folder.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
