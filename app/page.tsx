"use client";

import { useState } from "react";
import { Folder } from "@/types";
import {
  AddLinkForm,
  BackgroundShapes,
  FolderDrawer,
  FolderModal,
  Header,
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

export default function HomePage() {
  const { isDark } = useTheme();

  // Queries
  const { data: folders = [], isLoading: foldersLoading } = useFolders();
  const { data: links = [], isLoading: linksLoading } = useLinks();

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

  // Computed
  const linkCounts = links.reduce(
    (acc, link) => {
      const key = link.folder_id || "unsorted";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const isLoading = foldersLoading || linksLoading;

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
    if (link) {
      await deleteLink.mutateAsync(link);
    }
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
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 relative ${
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

        <AddLinkForm
          folders={folders}
          onSubmit={handleAddLink}
          onNewFolder={openNewFolderModal}
          isLoading={createLink.isPending}
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
