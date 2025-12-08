"use client";

import { useState } from "react";
import { Folder, Link } from "@/types";
import { MOCK_FOLDERS, MOCK_LINKS } from "@/lib/const";
import {
  AddLinkForm,
  FolderModal,
  FolderTabs,
  Header,
  LinkGrid,
} from "./components";

export default function HomePage() {
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);
  const [links, setLinks] = useState<Link[]>(MOCK_LINKS);
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

  // Handlers (these will connect to API later)
  const handleAddLink = (url: string, folderId: string | null) => {
    const newLink: Link = {
      id: Date.now().toString(),
      url,
      folder_id: folderId,
      created_at: new Date().toISOString(),
    };
    setLinks([newLink, ...links]);
  };

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id));
  };

  const handleMoveLink = (linkId: string, folderId: string | null) => {
    setLinks(
      links.map((link) =>
        link.id === linkId ? { ...link, folder_id: folderId } : link,
      ),
    );
  };

  const handleCreateFolder = (name: string) => {
    if (editingFolder) {
      // Update existing
      setFolders(
        folders.map((f) => (f.id === editingFolder.id ? { ...f, name } : f)),
      );
    } else {
      // Create new
      const newFolder: Folder = {
        id: Date.now().toString(),
        name,
        created_at: new Date().toISOString(),
      };
      setFolders([...folders, newFolder]);
    }
    setFolderModalOpen(false);
    setEditingFolder(null);
  };

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setFolderModalOpen(true);
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders(folders.filter((f) => f.id !== folderId));
    // Move links in deleted folder to unsorted
    setLinks(
      links.map((link) =>
        link.folder_id === folderId ? { ...link, folder_id: null } : link,
      ),
    );
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }
  };

  const openNewFolderModal = () => {
    setEditingFolder(null);
    setFolderModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Header />

        <AddLinkForm
          folders={folders}
          onSubmit={handleAddLink}
          onNewFolder={openNewFolderModal}
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
