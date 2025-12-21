"use client";

import { Fragment } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { useTheme } from "@/app/hooks/useTheme";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 backdrop-blur-sm z-40 ${
          isDark ? "bg-black/60" : "bg-black/40"
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className={clsx(
            "rounded-2xl shadow-xl",
            "w-full max-w-md",
            "animate-in fade-in zoom-in-95 duration-200",
            isDark
              ? "bg-stone-800 border border-stone-700"
              : "bg-amber-50 border border-stone-200"
          )}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-5 py-4 border-b ${
              isDark ? "border-stone-700" : "border-stone-200"
            }`}
          >
            <h2
              className={`text-lg font-semibold ${
                isDark ? "text-stone-100" : "text-stone-800"
              }`}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className={`p-1 rounded-lg transition-colors ${
                isDark
                  ? "text-stone-500 hover:text-stone-300 hover:bg-stone-700"
                  : "text-stone-400 hover:text-stone-600 hover:bg-stone-200"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5">{children}</div>
        </div>
      </div>
    </Fragment>
  );
}
