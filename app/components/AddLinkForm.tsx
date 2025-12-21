"use client";

import { useState } from "react";
import { Plus, Send, Loader2 } from "lucide-react";
import { Folder, Link } from "@/types";
import { Button, Input, Select } from "./custom-ui";

import { validateTwitterGif } from "@/app/actions";
import { useProcessVideo } from "@/app/hooks/useSupabase";

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
  const [url, setUrl] = useState("");
  const [folderId, setFolderId] = useState<string>("");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Video processing state
  const [processingVideo, setProcessingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [showManualVideoInput, setShowManualVideoInput] = useState(false);
  const [manualVideoUrl, setManualVideoUrl] = useState("");
  const [pendingLinkId, setPendingLinkId] = useState<string | null>(null);
  const [pendingTweetUrl, setPendingTweetUrl] = useState<string | null>(null);

  const processVideo = useProcessVideo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setError(null);
    setVideoError(null);
    setValidating(true);
    setShowManualVideoInput(false);

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
        // Video extraction failed - show manual input
        const errorMessage =
          videoErr instanceof Error ? videoErr.message : "Video extraction failed";
        setVideoError(errorMessage);
        setShowManualVideoInput(true);
        setPendingLinkId(createdLink.id);
        setPendingTweetUrl(url.trim());
        setProcessingVideo(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
      setValidating(false);
      setProcessingVideo(false);
    }
  };

  const handleManualVideoSubmit = async () => {
    if (!pendingLinkId || !manualVideoUrl.trim()) return;

    setProcessingVideo(true);
    setVideoError(null);

    try {
      await processVideo.mutateAsync({
        linkId: pendingLinkId,
        tweetUrl: pendingTweetUrl || "",
        manualVideoUrl: manualVideoUrl.trim(),
      });

      // Success - reset everything
      setUrl("");
      setManualVideoUrl("");
      setShowManualVideoInput(false);
      setPendingLinkId(null);
      setPendingTweetUrl(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process video";
      setVideoError(errorMessage);
    } finally {
      setProcessingVideo(false);
    }
  };

  const handleSkipVideo = () => {
    // User chose to skip video upload - just reset the form
    setUrl("");
    setManualVideoUrl("");
    setShowManualVideoInput(false);
    setPendingLinkId(null);
    setPendingTweetUrl(null);
    setVideoError(null);
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
                setVideoError(null);
                setShowManualVideoInput(false);
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
                  <Loader2 size={18} className="animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span className="hidden sm:inline">Save</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Manual Video URL Input Fallback */}
        {showManualVideoInput && (
          <div className="animate-in fade-in slide-in-from-top-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 mb-2">
              Couldn&apos;t auto-extract the video. To save the actual GIF/video:
            </p>
            <ol className="text-xs text-blue-700 mb-3 list-decimal list-inside space-y-1">
              <li>Open the tweet in a new tab</li>
              <li>Right-click on the GIF/video</li>
              <li>Select &quot;Copy video address&quot;</li>
              <li>Paste it below</li>
            </ol>
            <div className="flex gap-2 items-center">
              <Input
                type="url"
                placeholder="Paste video URL (e.g., video.twimg.com/...)"
                value={manualVideoUrl}
                onChange={(e) => setManualVideoUrl(e.target.value)}
                className="text-sm"
                disabled={processingVideo}
              />
              <Button
                type="button"
                size="sm"
                onClick={handleManualVideoSubmit}
                disabled={!manualVideoUrl.trim() || processingVideo}
              >
                {processingVideo ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleSkipVideo}
                disabled={processingVideo}
              >
                Skip
              </Button>
            </div>
            {videoError && (
              <p className="text-xs text-red-600 mt-2">{videoError}</p>
            )}
          </div>
        )}
      </div>

      {(error || (url && !isValidUrl)) && (
        <p className="mt-2 text-sm text-orange-600">
          {error || "Please enter a valid Twitter/X URL"}
        </p>
      )}
    </form>
  );
}
