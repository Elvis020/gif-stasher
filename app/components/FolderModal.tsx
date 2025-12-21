"use client";

import { useState, useEffect } from "react";
import { Folder } from "@/types";
import { Button, Input, Modal } from "./custom-ui";

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  folder?: Folder | null; // If provided, we're editing
  isLoading?: boolean;
}

export function FolderModal({
  isOpen,
  onClose,
  onSubmit,
  folder,
  isLoading,
}: FolderModalProps) {
  const [name, setName] = useState("");

  const isEditing = !!folder;

  useEffect(() => {
    if (folder) {
      setName(folder.name);
    } else {
      setName("");
    }
  }, [folder, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim());
    setName("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Rename Folder" : "New Folder"}
    >
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Folder name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim() || isLoading}>
            {isEditing ? "Save" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
