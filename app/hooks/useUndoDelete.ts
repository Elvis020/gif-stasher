"use client";

import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { UndoToast } from "@/app/components/UndoToast";
import { createElement } from "react";

interface UseUndoDeleteOptions {
  duration?: number;
}

export function useUndoDelete<T extends { id: string }>(
  options: UseUndoDeleteOptions = {}
) {
  const { duration = 5000 } = options;
  const pendingDeletes = useRef<Map<string, { item: T; timeoutId: ReturnType<typeof setTimeout> }>>(new Map());

  const deleteWithUndo = useCallback(
    async (
      item: T,
      onDelete: (item: T) => Promise<void>,
      onRestore: (item: T) => void,
      message: string = "Item deleted"
    ) => {
      const itemId = item.id;

      // Store the item for potential restoration
      const entry = { item, timeoutId: setTimeout(() => {}, 0) };
      pendingDeletes.current.set(itemId, entry);

      // Create a promise that resolves when delete is confirmed or undone
      return new Promise<boolean>((resolve) => {
        let isUndone = false;
        let toastId: string | number;

        const handleUndo = () => {
          isUndone = true;
          pendingDeletes.current.delete(itemId);
          onRestore(item);
          toast.dismiss(toastId);
          resolve(false); // Delete was cancelled
        };

        const handleComplete = async () => {
          if (isUndone) return;

          pendingDeletes.current.delete(itemId);

          try {
            await onDelete(item);
            resolve(true); // Delete was successful
          } catch (error) {
            console.error("Delete failed:", error);
            // Restore on failure
            onRestore(item);
            toast.error("Failed to delete");
            resolve(false);
          }
        };

        toastId = toast.custom(
          () =>
            createElement(UndoToast, {
              message,
              duration,
              onUndo: handleUndo,
              onComplete: handleComplete,
            }),
          {
            duration: duration + 500, // Slightly longer to ensure animation completes
            className: "!bg-stone-800 !border !border-stone-700 !rounded-xl !p-4",
          }
        );
      });
    },
    [duration]
  );

  return { deleteWithUndo };
}
