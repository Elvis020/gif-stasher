// lib/query-provider.tsx

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { useState, useEffect } from "react";

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 1000 * 60 * 60 * 24, // 24 hours - keep cache longer for Safari
        refetchOnWindowFocus: false,
        refetchOnMount: true, // Always refetch on mount for fresh data
      },
    },
  });

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const [persister, setPersister] = useState<ReturnType<
    typeof createSyncStoragePersister
  > | null>(null);

  useEffect(() => {
    // Create persister only on client side
    const storagePersister = createSyncStoragePersister({
      storage: window.localStorage,
      key: "gif-stash-cache",
    });
    setPersister(storagePersister);
  }, []);

  // Before persister is ready, use regular QueryClientProvider
  if (!persister) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Only persist successful queries for folders and links
            return (
              query.state.status === "success" &&
              (query.queryKey[0] === "folders" || query.queryKey[0] === "links")
            );
          },
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
