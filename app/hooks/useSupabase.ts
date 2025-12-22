import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Folder, Link } from "@/types";
import {
    extractVideoFromTweet,
    downloadAndUploadVideo,
    processManualVideoUrl,
    deleteVideoFromStorage,
} from "@/app/actions";

// Helper to get current user ID
async function getCurrentUserId(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
}

// --- Folders ---

export function useFolders() {
    return useQuery({
        queryKey: ["folders"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("folders")
                .select("*")
                .order("created_at", { ascending: true });

            if (error) throw error;
            return data as Folder[];
        },
    });
}

export function useCreateFolder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (name: string) => {
            const userId = await getCurrentUserId();
            if (!userId) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("folders")
                .insert([{ name, user_id: userId }])
                .select()
                .single();

            if (error) throw error;
            return data as Folder;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["folders"] });
        },
    });
}

export function useUpdateFolder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, name }: { id: string; name: string }) => {
            const { data, error } = await supabase
                .from("folders")
                .update({ name })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data as Folder;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["folders"] });
        },
    });
}

export function useDeleteFolder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            // First, update links to remove folder_id (if not handled by DB ON DELETE SET NULL)
            // Actually DB schema has ON DELETE SET NULL, so we can just delete the folder.
            const { error } = await supabase.from("folders").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["folders"] });
            queryClient.invalidateQueries({ queryKey: ["links"] }); // Links might change state
        },
    });
}

// --- Links ---

export function useLinks() {
    return useQuery({
        queryKey: ["links"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("links")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Link[];
        },
    });
}

export function useCreateLink() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            url,
            folder_id,
            thumbnail,
            video_status = "pending",
        }: {
            url: string;
            folder_id: string | null;
            thumbnail?: string | null;
            video_status?: "pending" | null;
        }) => {
            const userId = await getCurrentUserId();
            if (!userId) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("links")
                .insert([{ url, folder_id, thumbnail, video_status, user_id: userId }])
                .select()
                .single();

            if (error) throw error;
            return data as Link;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["links"] });
        },
    });
}

export function useMoveLink() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, folder_id }: { id: string; folder_id: string | null }) => {
            const { data, error } = await supabase
                .from("links")
                .update({ folder_id })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data as Link;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["links"] });
        },
    });
}

export function useDeleteLink() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (link: Link) => {
            const userId = await getCurrentUserId();
            if (!userId) throw new Error("Not authenticated");

            // Delete video from storage if exists (with ownership verification)
            if (link.video_path) {
                await deleteVideoFromStorage(link.video_path, link.id, userId);
            }

            // Delete link record
            const { error } = await supabase.from("links").delete().eq("id", link.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["links"] });
        },
    });
}

// --- Video Processing ---

export function useProcessVideo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            linkId,
            tweetUrl,
            manualVideoUrl,
        }: {
            linkId: string;
            tweetUrl: string;
            manualVideoUrl?: string;
        }) => {
            // Get current user ID for rate limiting
            const userId = await getCurrentUserId();

            // If manual URL provided, use it directly
            if (manualVideoUrl) {
                return processManualVideoUrl(manualVideoUrl, linkId, userId ?? undefined);
            }

            // Try automatic extraction
            const extraction = await extractVideoFromTweet(tweetUrl);
            if (!extraction.success || !extraction.videoUrl) {
                throw new Error(extraction.error || "Could not extract video");
            }

            // Pass thumbnail, title, and userId from extraction to save it
            const result = await downloadAndUploadVideo(extraction.videoUrl, linkId, extraction.thumbnail, extraction.title, userId ?? undefined);
            if (!result.success) {
                throw new Error(result.error || "Failed to process video");
            }
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["links"] });
        },
    });
}

// Retry failed video processing
export function useRetryVideo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (link: Link) => {
            // Always try extraction to get thumbnail and title
            const extraction = await extractVideoFromTweet(link.url);

            if (!link.original_video_url && (!extraction.success || !extraction.videoUrl)) {
                throw new Error(extraction.error || "Could not extract video");
            }

            // Get current user ID for rate limiting
            const userId = await getCurrentUserId();

            // Use original video URL if available, otherwise use extracted
            const videoUrl = link.original_video_url || extraction.videoUrl!;
            const result = await downloadAndUploadVideo(videoUrl, link.id, extraction.thumbnail, extraction.title, userId ?? undefined);
            if (!result.success) {
                throw new Error(result.error || "Failed to process video");
            }
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["links"] });
        },
    });
}
