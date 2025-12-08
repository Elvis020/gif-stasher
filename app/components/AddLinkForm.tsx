"use client";

import { useState } from "react";
import { Plus, Send } from "lucide-react";
import { Folder } from "@/types";
import { Button, Input, Select } from "./ui";

interface AddLinkFormProps {
  folders: Folder[];
  onSubmit: (url: string, folderId: string | null) => void;
  onNewFolder: () => void;
  isLoading?: boolean;
}

export function AddLinkForm({
  folders,
  onSubmit,
  onNewFolder,
  isLoading,
}: AddLinkFormProps) {
  const [url, setUrl] = useState("");
  const [folderId, setFolderId] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSubmit(url.trim(), folderId || null);
    setUrl("");
  };

  const isValidUrl =
    url.trim().length > 0 &&
    (url.includes("twitter.com") || url.includes("x.com"));

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="url"
            placeholder="Paste Twitter/X URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            className="min-w-[140px]"
          >
            <option value="">No folder</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </Select>

          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onNewFolder}
            className="px-2.5"
          >
            <Plus size={20} />
          </Button>

          <Button type="submit" disabled={!isValidUrl || isLoading}>
            <Send size={18} />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>

      {url && !isValidUrl && (
        <p className="mt-2 text-sm text-orange-600">
          Please enter a valid Twitter/X URL
        </p>
      )}
    </form>
  );
}
