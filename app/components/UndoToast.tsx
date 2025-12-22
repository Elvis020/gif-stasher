"use client";

import { useEffect, useState } from "react";
import { Undo2 } from "lucide-react";

interface UndoToastProps {
  message: string;
  duration?: number;
  onUndo: () => void;
  onComplete: () => void;
}

export function UndoToast({
  message,
  duration = 5000,
  onUndo,
  onComplete,
}: UndoToastProps) {
  const [progress, setProgress] = useState(100);
  const [isUndone, setIsUndone] = useState(false);

  useEffect(() => {
    if (isUndone) return;

    const interval = 50; // Update every 50ms for smooth animation
    const decrement = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - decrement;
        if (next <= 0) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [duration, onComplete, isUndone]);

  const handleUndo = () => {
    setIsUndone(true);
    onUndo();
  };

  if (isUndone) return null;

  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-stone-200">{message}</span>
        <button
          onClick={handleUndo}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-400 hover:text-amber-300 hover:bg-stone-700 rounded-lg transition-colors"
        >
          <Undo2 className="w-4 h-4" />
          Undo
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-1 w-full bg-stone-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 transition-all duration-50 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
