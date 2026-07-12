"use client";

import { Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/cn";

type ReceiptUploadZoneProps = {
  isDragging: boolean;
  isProcessing: boolean;
  onDragEnter: (event: React.DragEvent) => void;
  onDragLeave: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
};

export function ReceiptUploadZone({
  isDragging,
  isProcessing,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onClick,
  onKeyDown,
}: ReceiptUploadZoneProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-8 py-12 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-600/30",
        isDragging
          ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/30"
          : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-zinc-600"
      )}
    >
      {isProcessing ? (
        <>
          <Loader2
            className="h-10 w-10 animate-spin text-primary"
            aria-hidden="true"
          />
          <p className="mt-4 text-sm font-medium text-foreground">
            Processing image…
          </p>
        </>
      ) : (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-zinc-900">
            <Upload
              className="h-7 w-7 text-primary"
              aria-hidden="true"
            />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            Drag & drop your receipt here
          </p>
          <p className="mt-1 text-xs text-muted">
            or click to browse files
          </p>
          <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
            JPG, PNG or HEIC
          </p>
        </>
      )}
    </div>
  );
}
