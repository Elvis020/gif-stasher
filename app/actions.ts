"use server";

import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role for storage operations
function getServerSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

// Types for video operations
interface VideoExtractResult {
    success: boolean;
    videoUrl?: string;
    thumbnail?: string;
    error?: string;
}

interface UploadResult {
    success: boolean;
    videoUrl?: string;
    videoPath?: string;
    videoSize?: number;
    error?: string;
}

export async function validateTwitterGif(url: string) {
    try {
        // Basic URL validation
        if (!url.includes("twitter.com") && !url.includes("x.com")) {
            return { isValid: false, error: "Not a Twitter/X URL" };
        }

        // Use Twitter's public OEmbed API to verify the tweet exists and is public
        // This doesn't strictly check for GIFs vs Videos, but confirms it is a valid Tweet
        const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;

        const response = await fetch(oembedUrl, {
            // Use standard headers
            next: { revalidate: 3600 } // Cache positive results for an hour
        });

        if (response.status === 404) {
            return { isValid: false, error: "Tweet not found or is private" };
        }

        if (!response.ok) {
            // 403 or other errors
            return { isValid: false, error: "Could not verify Tweet" };
        }

        const data = await response.json();

        if (data.provider_name !== "Twitter" && data.provider_name !== "X") {
            return { isValid: false, error: "Invalid provider" };
        }

        // If we got here, it's a valid public Tweet!

        // Attempt to scrape the thumbnail (og:image) for the preview
        // We do this AFTER IsValid Check to avoid wasting resources on invalid links
        let thumbnail = null;
        try {
            const pageResponse = await fetch(url, {
                headers: {
                    "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
                },
                next: { revalidate: 3600 }
            });

            if (pageResponse.ok) {
                const html = await pageResponse.text();
                const match = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
                if (match && match[1]) {
                    thumbnail = match[1];
                }
            }
        } catch (e) {
            console.error("Failed to scrape thumbnail", e);
        }

        return { isValid: true, thumbnail };

    } catch (error) {
        console.error("Validation error:", error);
        return { isValid: false, error: "Validation failed" };
    }
}

// Extract video URL from tweet using Syndication API
export async function extractVideoFromTweet(tweetUrl: string): Promise<VideoExtractResult> {
    try {
        // Extract tweet ID from URL
        const tweetIdMatch = tweetUrl.match(/status\/(\d+)/);
        if (!tweetIdMatch) {
            return { success: false, error: "Could not extract tweet ID" };
        }
        const tweetId = tweetIdMatch[1];

        // Try Syndication API
        const syndicationUrl = `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=0`;

        const response = await fetch(syndicationUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; GifStash/1.0)",
            },
        });

        if (!response.ok) {
            return {
                success: false,
                error: "Tweet not accessible. Try providing the video URL manually.",
            };
        }

        const data = await response.json();

        let videoUrl: string | undefined;
        let thumbnail: string | undefined;

        // Check for video in mediaDetails (common structure)
        if (data.mediaDetails) {
            for (const media of data.mediaDetails) {
                if (media.type === "video" || media.type === "animated_gif") {
                    // Check duration - reject videos longer than 10 seconds
                    const durationMs = media.video_info?.duration_millis || 0;
                    const MAX_DURATION_MS = 10000; // 10 seconds
                    if (durationMs > MAX_DURATION_MS) {
                        console.log(`Video too long (${(durationMs / 1000).toFixed(1)}s). Maximum is 10 seconds.`);
                        return {
                            success: false,
                            error: "Only short GIFs allowed",
                        };
                    }

                    const variants = media.video_info?.variants || [];
                    const mp4Variants = variants
                        .filter((v: { content_type: string }) => v.content_type === "video/mp4")
                        .sort((a: { bitrate?: number }, b: { bitrate?: number }) =>
                            (b.bitrate || 0) - (a.bitrate || 0)
                        );

                    if (mp4Variants.length > 0) {
                        videoUrl = mp4Variants[0].url;
                        thumbnail = media.media_url_https;
                    }
                }
            }
        }

        // Alternative: check video field directly
        if (!videoUrl && data.video?.variants) {
            const mp4Variants = data.video.variants
                .filter((v: { type: string }) => v.type === "video/mp4")
                .sort((a: { bitrate?: number }, b: { bitrate?: number }) =>
                    (b.bitrate || 0) - (a.bitrate || 0)
                );

            if (mp4Variants.length > 0) {
                videoUrl = mp4Variants[0].src;
            }
        }

        // Get thumbnail from photos if not found
        if (!thumbnail && data.photos?.[0]) {
            thumbnail = data.photos[0].url;
        }

        if (!videoUrl) {
            return {
                success: false,
                error: "No video found in tweet. This might be an image-only tweet.",
            };
        }

        return { success: true, videoUrl, thumbnail };
    } catch (error) {
        console.error("Video extraction error:", error);
        return { success: false, error: "Failed to extract video from tweet" };
    }
}

// Download video and upload to Supabase Storage
// Stores as MP4 directly (no ffmpeg conversion needed)
export async function downloadAndUploadVideo(
    videoSourceUrl: string,
    linkId: string,
    thumbnail?: string
): Promise<UploadResult> {
    const supabase = getServerSupabase();

    try {
        // Update status to downloading (and thumbnail if provided)
        const updateData: Record<string, unknown> = {
            video_status: "downloading",
            original_video_url: videoSourceUrl,
        };
        if (thumbnail) {
            updateData.thumbnail = thumbnail;
        }
        await supabase
            .from("links")
            .update(updateData)
            .eq("id", linkId);

        // Download the video
        const response = await fetch(videoSourceUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; GifStash/1.0)",
                Referer: "https://twitter.com/",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to download: ${response.status}`);
        }

        // Check content-type to reject static images
        const contentType = response.headers.get("content-type") || "";
        const imageTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/bmp"];
        if (imageTypes.some(type => contentType.includes(type))) {
            throw new Error("Static images are not supported. Only videos and GIFs can be saved.");
        }

        const arrayBuffer = await response.arrayBuffer();
        const videoBuffer = Buffer.from(arrayBuffer);
        const videoSize = videoBuffer.length;

        // Check size limit (15MB for video)
        const MAX_VIDEO_SIZE = 15 * 1024 * 1024; // 15MB
        if (videoSize > MAX_VIDEO_SIZE) {
            throw new Error(`Video too large (${(videoSize / 1024 / 1024).toFixed(1)}MB). Maximum is 15MB.`);
        }

        // Generate short unique filename
        const randomId = Math.random().toString(36).substring(2, 8); // 6 chars
        const fileName = `${randomId}.mp4`;
        const filePath = fileName;

        // Upload MP4 directly to Supabase Storage (no conversion needed)
        const { error: uploadError } = await supabase.storage
            .from("Videos")
            .upload(filePath, videoBuffer, {
                contentType: "video/mp4",
                cacheControl: "31536000", // 1 year cache
                upsert: false,
            });

        if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from("Videos")
            .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;

        // Update link record
        await supabase
            .from("links")
            .update({
                video_url: publicUrl,
                video_path: filePath,
                video_size: videoSize,
                video_status: "uploaded",
                video_error: null,
            })
            .eq("id", linkId);

        return {
            success: true,
            videoUrl: publicUrl,
            videoPath: filePath,
            videoSize: videoSize,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        // Update link with error status
        await supabase
            .from("links")
            .update({
                video_status: "failed",
                video_error: errorMessage,
            })
            .eq("id", linkId);

        console.error("Video upload error:", error);
        return { success: false, error: errorMessage };
    }
}

// Process manually provided video URL
export async function processManualVideoUrl(
    manualVideoUrl: string,
    linkId: string
): Promise<UploadResult> {
    const urlLower = manualVideoUrl.toLowerCase();

    // Block static image URLs
    const imagePatterns = [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff", "pbs.twimg.com/media"];
    const looksLikeImage = imagePatterns.some((pattern) =>
        urlLower.includes(pattern)
    );

    if (looksLikeImage) {
        return { success: false, error: "Static images are not supported. Please provide a video/GIF URL." };
    }

    // Validate it looks like a video URL
    const videoPatterns = [".mp4", ".webm", ".gif", "video.twimg.com"];
    const looksLikeVideo = videoPatterns.some((pattern) =>
        urlLower.includes(pattern)
    );

    if (!looksLikeVideo) {
        return { success: false, error: "URL does not appear to be a video file" };
    }

    return downloadAndUploadVideo(manualVideoUrl, linkId);
}

// Delete video from storage
export async function deleteVideoFromStorage(videoPath: string): Promise<boolean> {
    try {
        const supabase = getServerSupabase();

        const { error } = await supabase.storage.from("Videos").remove([videoPath]);

        if (error) {
            console.error("Failed to delete video:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Delete video error:", error);
        return false;
    }
}

// Claim unclaimed records for a user (migration)
// Uses service role to bypass RLS
export async function claimUnclaimedRecords(userId: string): Promise<{
    success: boolean;
    claimedLinks: number;
    claimedFolders: number;
    error?: string;
}> {
    try {
        const supabase = getServerSupabase();

        // Claim unclaimed links
        const { data: links, error: linksError } = await supabase
            .from("links")
            .update({ user_id: userId })
            .is("user_id", null)
            .select("id");

        if (linksError) {
            throw new Error(`Failed to claim links: ${linksError.message}`);
        }

        // Claim unclaimed folders
        const { data: folders, error: foldersError } = await supabase
            .from("folders")
            .update({ user_id: userId })
            .is("user_id", null)
            .select("id");

        if (foldersError) {
            throw new Error(`Failed to claim folders: ${foldersError.message}`);
        }

        return {
            success: true,
            claimedLinks: links?.length || 0,
            claimedFolders: folders?.length || 0,
        };
    } catch (error) {
        console.error("Claim records error:", error);
        return {
            success: false,
            claimedLinks: 0,
            claimedFolders: 0,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
