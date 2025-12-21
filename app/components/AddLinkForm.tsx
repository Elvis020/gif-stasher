"use client";

import { useState } from "react";
import { Send, Loader2, X } from "lucide-react";
import { Folder, Link } from "@/types";
import { Button, Input } from "./custom-ui";
import { toast } from "sonner";

import { validateTwitterGif } from "@/app/actions";
import { useProcessVideo, useDeleteLink } from "@/app/hooks/useSupabase";
import { useTheme } from "@/app/hooks/useTheme";

interface AddLinkFormProps {
  folders: Folder[];
  onSubmit: (
    url: string,
    folderId: string | null,
    thumbnail?: string | null
  ) => Promise<Link>;
  onNewFolder: () => void;
  isLoading: boolean;
  onSaveSuccess?: () => void;
}

export function AddLinkForm({
  folders,
  onSubmit,
  onNewFolder,
  isLoading,
  onSaveSuccess,
}: AddLinkFormProps) {
  const { isDark } = useTheme();
  const [url, setUrl] = useState("");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processVideo = useProcessVideo();
  const deleteLink = useDeleteLink();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setError(null);
    setValidating(true);

    try {
      const result = await validateTwitterGif(url.trim());

      if (!result.isValid) {
        setError(result.error || "Invalid link");
        setValidating(false);
        return;
      }

      setValidating(false);
      const createdLink = await onSubmit(url.trim(), null, result.thumbnail);
      onSaveSuccess?.();

      try {
        await processVideo.mutateAsync({
          linkId: createdLink.id,
          tweetUrl: url.trim(),
        });
        setUrl("");
      } catch (videoErr) {
        const errorMessage =
          videoErr instanceof Error ? videoErr.message : "Video extraction failed";

        try {
          await deleteLink.mutateAsync(createdLink);
        } catch (deleteErr) {
          console.error("Failed to delete link:", deleteErr);
        }

        toast.error(errorMessage);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
      setValidating(false);
    }
  };

  const handleInputClick = async () => {
    if (url.trim() || isProcessing) return;

    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText.includes("twitter.com") || clipboardText.includes("x.com")) {
        setUrl(clipboardText.trim());
      }
    } catch {
      // Clipboard access denied - ignore
    }
  };

  const isValidUrl =
    url.trim().length > 0 &&
    (url.includes("twitter.com") || url.includes("x.com"));

  const isProcessing = validating || isLoading || processVideo.isPending;

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              type="url"
              placeholder="Paste Twitter/X URL here..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              onClick={handleInputClick}
              disabled={isProcessing}
              className={url ? "pr-10" : ""}
            />
            {url && !isProcessing && (
              <button
                type="button"
                onClick={() => {
                  setUrl("");
                  setError(null);
                }}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                  isDark
                    ? "text-stone-400 hover:text-stone-200 hover:bg-stone-700"
                    : "text-stone-400 hover:text-stone-600 hover:bg-stone-200"
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={!isValidUrl || isProcessing}>
              {validating ? (
                <span className="animate-pulse">Checking...</span>
              ) : processVideo.isPending ? (
                <>
                  <Loader2 className="w-[1.125rem] h-[1.125rem] animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <>
                  <Send className="w-[1.125rem] h-[1.125rem]" />
                  <span className="hidden sm:inline">Save</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {(error || (url && !isValidUrl)) && (
        <p
          className={`mt-2 text-sm ${
            isDark ? "text-orange-400" : "text-orange-600"
          }`}
        >
          {error || "Please enter a valid Twitter/X URL"}
        </p>
      )}
    </form>
  );
}
