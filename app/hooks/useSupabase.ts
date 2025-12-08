import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Folder, Link } from "@/types";

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
            const { data, error } = await supabase
                .from("folders")
                .insert([{ name }])
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
        mutationFn: async ({ url, folder_id }: { url: string; folder_id: string | null }) => {
            const { data, error } = await supabase
                .from("links")
                .insert([{ url, folder_id }])
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
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("links").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["links"] });
        },
    });
}
