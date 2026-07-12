"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { useReceiptDrop } from "@/lib/receipt-drop-context";
import { isAcceptedReceiptImage } from "@/lib/receipt-image";

export function GlobalReceiptDrop() {
  const router = useRouter();
  const { setPendingFile } = useReceiptDrop();
  const [isDragging, setIsDragging] = useState(false);
  const [, setDragCount] = useState(0);

  const handleFile = useCallback(
    (file: File) => {
      if (!isAcceptedReceiptImage(file)) {
        return;
      }

      setPendingFile(file);
      router.push("/receipt-scanner");
    },
    [router, setPendingFile]
  );

  useEffect(() => {
    const onDragEnter = (event: DragEvent) => {
      if (!event.dataTransfer?.types.includes("Files")) {
        return;
      }

      event.preventDefault();
      setDragCount((count) => count + 1);
      setIsDragging(true);
    };

    const onDragLeave = (event: DragEvent) => {
      event.preventDefault();
      setDragCount((count) => {
        const next = Math.max(0, count - 1);
        if (next === 0) {
          setIsDragging(false);
        }
        return next;
      });
    };

    const onDragOver = (event: DragEvent) => {
      if (!event.dataTransfer?.types.includes("Files")) {
        return;
      }

      event.preventDefault();
    };

    const onDrop = (event: DragEvent) => {
      event.preventDefault();
      setDragCount(0);
      setIsDragging(false);

      const file = event.dataTransfer?.files?.[0];
      if (file) {
        handleFile(file);
      }
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("drop", onDrop);

    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("drop", onDrop);
    };
  }, [handleFile]);

  if (!isDragging) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-blue-600/10 p-6 backdrop-blur-[1px]">
      <div className="flex max-w-lg flex-col items-center rounded-2xl border-2 border-dashed border-blue-500 bg-white/95 px-10 py-12 text-center shadow-xl dark:bg-zinc-900/95">
        <Upload
          className="h-12 w-12 text-primary"
          aria-hidden="true"
        />
        <p className="mt-4 text-lg font-semibold text-foreground">
          Drop your receipt anywhere to scan it.
        </p>
        <p className="mt-2 text-sm text-muted">
          JPG, PNG or HEIC
        </p>
      </div>
    </div>
  );
}
