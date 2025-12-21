"use client";

import { useState } from "react";
import { Folder } from "@/types";
import {
  AddLinkForm,
  FolderModal,
  FolderTabs,
  Header,
  LinkGrid,
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

export default function HomePage() {
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

  // State
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Modal state
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  // Computed
  const filteredLinks = selectedFolderId
    ? links.filter((link) => link.folder_id === selectedFolderId)
    : links;

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
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }
  };

  const openNewFolderModal = () => {
    setEditingFolder(null);
    setFolderModalOpen(true);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-amber-50 flex items-center justify-center text-stone-500">
        Loading your stash...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-amber-50 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Header />

        <AddLinkForm
          folders={folders}
          onSubmit={handleAddLink}
          onNewFolder={openNewFolderModal}
          isLoading={createLink.isPending}
        />

        <FolderTabs
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelect={setSelectedFolderId}
          onEdit={handleEditFolder}
          onDelete={handleDeleteFolder}
          linkCounts={linkCounts}
        />

        <LinkGrid
          links={filteredLinks}
          folders={folders}
          onDelete={handleDeleteLink}
          onMove={handleMoveLink}
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
