"use client";

import { useState, useEffect } from "react";
import { Folder, Link } from "@/types";
import {
  AddLinkForm,
  BackgroundShapes,
  FolderDrawer,
  FolderModal,
  Header,
  SignInBanner,
} from "./components";
import {
  useFolders,
  useLinks,
  useCreateLink,
  useDeleteLink,
  useMoveLink,
  useCreateFolder,
  useUpdateFolder,
  useDeleteFolder,
} from "./hooks/useSupabase";
import { useTheme } from "./hooks/useTheme";
import { useAuth } from "./hooks/useAuth";
import { useUndoDelete } from "./hooks/useUndoDelete";
import { claimUnclaimedRecords } from "./actions";
import { useQueryClient } from "@tanstack/react-query";

export default function HomePage() {
  const { isDark } = useTheme();
  const { user, isLoading: authLoading, hasClaimed, markAsClaimed } = useAuth();
  const queryClient = useQueryClient();
  const { deleteWithUndo } = useUndoDelete<Link>();

  // Queries - only run when authenticated
  const { data: folders = [], isLoading: foldersLoading } = useFolders();
  const { data: links = [], isLoading: linksLoading } = useLinks();

  // Run migration to claim unclaimed records on first auth
  useEffect(() => {
    const runMigration = async () => {
      if (user && !hasClaimed) {
        console.log("Running migration to claim existing records...");
        const result = await claimUnclaimedRecords(user.id);
        if (result.success) {
          console.log(`Claimed ${result.claimedLinks} links and ${result.claimedFolders} folders`);
          markAsClaimed();
          // Refresh data after claiming
          window.location.reload();
        } else {
          console.error("Migration failed:", result.error);
          // Still mark as claimed to avoid retry loop
          markAsClaimed();
        }
      }
    };
    runMigration();
  }, [user, hasClaimed, markAsClaimed]);

  // Mutations
  const createLink = useCreateLink();
  const deleteLink = useDeleteLink();
  const moveLink = useMoveLink();
  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const deleteFolder = useDeleteFolder();

  // Modal state
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  // Folder drawer state
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);

  // Computed
  const linkCounts = links.reduce(
    (acc, link) => {
      const key = link.folder_id || "unsorted";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const isLoading = authLoading || foldersLoading || linksLoading;

  // Handlers
  const handleAddLink = async (
    url: string,
    folderId: string | null,
    thumbnail?: string | null
  ) => {
    const link = await createLink.mutateAsync({
      url,
      folder_id: folderId,
      thumbnail,
    });
    return link;
  };

  const handleDeleteLink = async (id: string) => {
    const link = links.find((l) => l.id === id);
    if (!link) return;

    // Optimistically remove from cache
    queryClient.setQueryData<Link[]>(["links"], (old) =>
      old?.filter((l) => l.id !== id) ?? []
    );

    // Show undo toast and wait for confirmation or undo
    await deleteWithUndo(
      link,
      // On confirm delete
      async (linkToDelete) => {
        await deleteLink.mutateAsync(linkToDelete);
      },
      // On undo - restore to cache
      (linkToRestore) => {
        queryClient.setQueryData<Link[]>(["links"], (old) =>
          old ? [...old, linkToRestore].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ) : [linkToRestore]
        );
      },
      "GIF deleted"
    );
  };

  const handleMoveLink = (linkId: string, folderId: string | null) => {
    moveLink.mutate({ id: linkId, folder_id: folderId });
  };

  const handleCreateFolder = (name: string) => {
    if (editingFolder) {
      updateFolder.mutate({ id: editingFolder.id, name });
    } else {
      createFolder.mutate(name);
    }
    setFolderModalOpen(false);
    setEditingFolder(null);
  };

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setFolderModalOpen(true);
  };

  const handleDeleteFolder = (folderId: string) => {
    deleteFolder.mutate(folderId);
  };

  const openNewFolderModal = () => {
    setEditingFolder(null);
    setFolderModalOpen(true);
  };

  if (isLoading) {
    return (
      <main
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 relative grainy ${
          isDark ? "bg-stone-900 text-stone-400" : "bg-amber-50 text-stone-500"
        }`}
      >
        <BackgroundShapes />
        <span className="relative z-10">Loading your stash...</span>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen transition-colors duration-300 relative ${
        isDark ? "bg-stone-900" : "bg-amber-50"
      }`}
    >
      <BackgroundShapes />
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <Header />

        <SignInBanner linkCount={links.length} />

        <AddLinkForm
          folders={folders}
          onSubmit={handleAddLink}
          onNewFolder={openNewFolderModal}
          isLoading={createLink.isPending}
          onSaveSuccess={() => {
            setOpenFolderId("unsorted");
          }}
        />

        <FolderDrawer
          folders={folders}
          links={links}
          onDeleteLink={handleDeleteLink}
          onMoveLink={handleMoveLink}
          onNewFolder={openNewFolderModal}
          onEditFolder={handleEditFolder}
          onDeleteFolder={handleDeleteFolder}
          linkCounts={linkCounts}
          openFolderId={openFolderId}
          onOpenFolderChange={setOpenFolderId}
        />

        <FolderModal
          isOpen={folderModalOpen}
          onClose={() => {
            setFolderModalOpen(false);
            setEditingFolder(null);
          }}
          onSubmit={handleCreateFolder}
          folder={editingFolder}
        />
      </div>
    </main>
  );
}
