"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Plus, Sparkles, X } from "lucide-react";
import { Folder, Link } from "@/types";
import {
  AddLinkForm,
  BackgroundShapes,
  ErrorBoundary,
  FolderModal,
  GalleryFolderCard,
  GalleryModal,
  Header,
  NetworkStatus,
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
import { clsx } from "clsx";

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

  // Gallery state
  const [selectedFolder, setSelectedFolder] = useState<{ id: string; name: string } | null>(null);
  const [randomGif, setRandomGif] = useState<Link | null>(null);

  const isDataLoading = foldersLoading || linksLoading;

  // Compute folder data with links and recency sorting
  const folderData = useMemo(() => {
    // Group links by folder
    const unsortedLinks = links.filter((l) => !l.folder_id);
    const folderLinksMap = new Map<string, Link[]>();

    // Initialize with empty arrays for all folders
    folders.forEach((f) => folderLinksMap.set(f.id, []));

    // Populate with actual links
    links.forEach((link) => {
      if (link.folder_id && folderLinksMap.has(link.folder_id)) {
        folderLinksMap.get(link.folder_id)!.push(link);
      }
    });

    // Create folder items with computed data
    const items = [
      {
        id: "unsorted",
        name: "Unsorted",
        isUnsorted: true,
        links: unsortedLinks,
        lastUpdated: unsortedLinks[0]?.created_at
          ? new Date(unsortedLinks[0].created_at)
          : new Date(0),
      },
      ...folders.map((f) => {
        const folderLinks = folderLinksMap.get(f.id) || [];
        return {
          id: f.id,
          name: f.name,
          isUnsorted: false,
          links: folderLinks,
          lastUpdated: folderLinks[0]?.created_at
            ? new Date(folderLinks[0].created_at)
            : new Date(f.created_at),
          folder: f,
        };
      }),
    ];

    // Sort by recency (most recently updated first)
    return items.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  }, [folders, links]);

  // Get links for selected folder
  const selectedFolderLinks = useMemo(() => {
    if (!selectedFolder) return [];
    if (selectedFolder.id === "unsorted") {
      return links.filter((l) => !l.folder_id);
    }
    return links.filter((l) => l.folder_id === selectedFolder.id);
  }, [selectedFolder, links]);

  // Random GIF picker
  const pickRandomGif = useCallback(() => {
    const allWithVideos = links.filter((l) => l.video_url);
    if (allWithVideos.length === 0) return;
    const random = allWithVideos[Math.floor(Math.random() * allWithVideos.length)];
    setRandomGif(random);
  }, [links]);

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
      async (linkToDelete) => {
        await deleteLink.mutateAsync(linkToDelete);
      },
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

  const openNewFolderModal = () => {
    setEditingFolder(null);
    setFolderModalOpen(true);
  };

  const hasGifs = links.filter((l) => l.video_url).length > 0;

  return (
    <ErrorBoundary isDark={isDark}>
      <NetworkStatus />
      <main
        className={`min-h-screen transition-colors duration-300 relative ${
          isDark ? "bg-stone-900" : "bg-amber-50"
        }`}
      >
        <BackgroundShapes />
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 relative z-10">
          <Header />

          <SignInBanner linkCount={links.length} />

          {/* Show form immediately, even during auth loading */}
          {!authLoading && (
            <AddLinkForm
              folders={folders}
              onSubmit={handleAddLink}
              onNewFolder={openNewFolderModal}
              isLoading={createLink.isPending}
              onSaveSuccess={() => {
                // Open the unsorted folder after saving
                setSelectedFolder({ id: "unsorted", name: "Unsorted" });
              }}
            />
          )}

          {/* Random GIF button when there are GIFs */}
          {hasGifs && !isDataLoading && (
            <motion.div
              className="flex justify-center mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                onClick={pickRandomGif}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all",
                  "text-sm",
                  isDark
                    ? "bg-stone-800 hover:bg-stone-700 text-amber-400 border border-stone-700"
                    : "bg-white hover:bg-stone-50 text-amber-600 border border-stone-200"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Shuffle className="w-4 h-4" />
                Surprise Me
              </motion.button>
            </motion.div>
          )}

          {/* Show skeleton while loading, otherwise show gallery grid */}
          {authLoading || isDataLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={clsx(
                    "aspect-square rounded-2xl animate-pulse",
                    isDark ? "bg-stone-800" : "bg-stone-200"
                  )}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {folderData.map((folder, index) => (
                <GalleryFolderCard
                  key={folder.id}
                  folder={folder}
                  links={folder.links}
                  onClick={() =>
                    setSelectedFolder({ id: folder.id, name: folder.name })
                  }
                  index={index}
                />
              ))}

              {/* Add Folder Card */}
              <motion.button
                onClick={openNewFolderModal}
                className={clsx(
                  "aspect-square rounded-2xl border-2 border-dashed",
                  "flex flex-col items-center justify-center gap-2",
                  "transition-all duration-200",
                  isDark
                    ? "border-stone-700 hover:border-amber-500 text-stone-500 hover:text-amber-400"
                    : "border-stone-300 hover:border-amber-400 text-stone-400 hover:text-amber-500"
                )}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: folderData.length * 0.08 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-8 h-8" />
                <span className="text-sm font-medium">New Folder</span>
              </motion.button>
            </div>
          )}

          {/* Folder Modal for create/edit */}
          <FolderModal
            isOpen={folderModalOpen}
            onClose={() => {
              setFolderModalOpen(false);
              setEditingFolder(null);
            }}
            onSubmit={handleCreateFolder}
            folder={editingFolder}
          />

          {/* Gallery Modal for viewing folder contents */}
          <GalleryModal
            isOpen={!!selectedFolder}
            onClose={() => setSelectedFolder(null)}
            folder={selectedFolder}
            links={selectedFolderLinks}
            allFolders={folders}
            onDeleteLink={handleDeleteLink}
            onMoveLink={handleMoveLink}
          />

          {/* Random GIF Modal */}
          <AnimatePresence>
            {randomGif && (
              <>
                <motion.div
                  className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setRandomGif(null)}
                />
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="relative max-w-lg w-full"
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Close button */}
                    <button
                      onClick={() => setRandomGif(null)}
                      className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {/* Surprise header */}
                    <motion.div
                      className="flex items-center justify-center gap-2 mb-4"
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <span className="text-white font-semibold">
                        Random Discovery
                      </span>
                      <Sparkles className="w-5 h-5 text-amber-400" />
                    </motion.div>

                    {/* Video */}
                    <div className="rounded-2xl overflow-hidden shadow-2xl">
                      <video
                        src={randomGif.video_url!}
                        className="w-full"
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls
                      />
                    </div>

                    {/* Title */}
                    {randomGif.title && (
                      <motion.p
                        className="text-white/80 text-center mt-4 text-sm"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {randomGif.title}
                      </motion.p>
                    )}

                    {/* Shuffle again button */}
                    <motion.button
                      onClick={pickRandomGif}
                      className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Shuffle className="w-4 h-4" />
                      Show Me Another
                    </motion.button>
                  </motion.div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </main>
    </ErrorBoundary>
  );
}
