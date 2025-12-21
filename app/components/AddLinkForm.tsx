"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
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
}

export function AddLinkForm({
  folders,
  onSubmit,
  onNewFolder,
  isLoading,
}: AddLinkFormProps) {
  const { isDark } = useTheme();
  const [url, setUrl] = useState("");
  const [folderId, setFolderId] = useState<string>("");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingVideo, setProcessingVideo] = useState(false);

  const processVideo = useProcessVideo();
  const deleteLink = useDeleteLink();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setError(null);
    setValidating(true);

    try {
      // Step 1: Validate the tweet
      const result = await validateTwitterGif(url.trim());

      if (!result.isValid) {
        setError(result.error || "Invalid link");
        setValidating(false);
        return;
      }

      // Step 2: Create the link record
      const createdLink = await onSubmit(
        url.trim(),
        folderId || null,
        result.thumbnail
      );

      setValidating(false);
      setProcessingVideo(true);

      // Step 3: Try to extract and upload video
      try {
        await processVideo.mutateAsync({
          linkId: createdLink.id,
          tweetUrl: url.trim(),
        });

        // Success - reset form
        setUrl("");
        setProcessingVideo(false);
      } catch (videoErr) {
        // Video extraction failed - delete the link and show error
        const errorMessage =
          videoErr instanceof Error ? videoErr.message : "Video extraction failed";

        // Delete the partially created link
        try {
          await deleteLink.mutateAsync(createdLink);
        } catch (deleteErr) {
          console.error("Failed to delete link:", deleteErr);
        }

        toast.error(errorMessage);
        setProcessingVideo(false);
        // Keep URL in input so user can try again or copy it
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
      setValidating(false);
      setProcessingVideo(false);
    }
  };

  const isValidUrl =
    url.trim().length > 0 &&
    (url.includes("twitter.com") || url.includes("x.com"));

  const isProcessing = validating || isLoading || processingVideo;

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="url"
              placeholder="Paste Twitter/X URL here..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              disabled={isProcessing}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={!isValidUrl || isProcessing}>
              {validating ? (
                <span className="animate-pulse">Checking...</span>
              ) : processingVideo ? (
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
