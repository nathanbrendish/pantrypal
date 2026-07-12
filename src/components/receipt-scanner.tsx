"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ReceiptImagePreview } from "@/components/receipt-image-preview";
import { ReceiptIngredientReview } from "@/components/receipt-ingredient-review";
import { ReceiptUploadZone } from "@/components/receipt-upload-zone";
import {
  ACCEPTED_RECEIPT_INPUT,
  isAcceptedReceiptImage,
  MAX_RECEIPT_INPUT_BYTES,
  optimiseReceiptImage,
  processReceiptImage,
  SAFE_UPLOAD_MAX_BYTES,
  type ReceiptImageMeta,
} from "@/lib/receipt-image";
import { useReceiptDrop } from "@/lib/receipt-drop-context";
import { toUserFacingScanError } from "@/lib/scan-receipt-errors";
import { createScanRequestId, logClientScanEvent } from "@/lib/scan-receipt-logger";
import { scanReceiptImage } from "@/lib/scan-receipt-client";
import type { FoodCategory, StorageLocation } from "@/types/taxonomy";
import type { ScannedIngredient } from "@/types/v2";

type ScannerStep = "upload" | "preview" | "review";

type ReceiptScannerProps = {
  storageLocations: StorageLocation[];
  categories: FoodCategory[];
};

export function ReceiptScanner({
  storageLocations,
  categories,
}: ReceiptScannerProps) {
  const { consumePendingFile } = useReceiptDrop();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const selectedFileRef = useRef<File | null>(null);
  const imageMetaRef = useRef<ReceiptImageMeta | null>(null);
  const handledPendingRef = useRef(false);

  const [step, setStep] = useState<ScannerStep>("upload");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isHeic, setIsHeic] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [busyMessage, setBusyMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<ScannedIngredient[]>([]);

  const revokePreviewUrl = useCallback((url: string | null) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }, []);

  const resetToUpload = useCallback(() => {
    revokePreviewUrl(previewUrlRef.current);
    previewUrlRef.current = null;
    selectedFileRef.current = null;
    imageMetaRef.current = null;
    setPreviewUrl(null);
    setFileName(null);
    setIsHeic(false);
    setError(null);
    setBusyMessage(null);
    setIngredients([]);
    setStep("upload");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [revokePreviewUrl]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!isAcceptedReceiptImage(file)) {
        setError("This image format isn't supported.");
        return;
      }

      if (file.size > MAX_RECEIPT_INPUT_BYTES) {
        setError("The receipt image is too large.");
        return;
      }

      setError(null);
      setIngredients([]);
      setStep("preview");
      setIsProcessing(true);
      setBusyMessage(
        file.size > SAFE_UPLOAD_MAX_BYTES
          ? "Optimising receipt image..."
          : "Processing image…"
      );

      revokePreviewUrl(previewUrlRef.current);

      logClientScanEvent("file_selected", {
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type || "(empty)",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      });

      try {
        const result = await processReceiptImage(file);
        previewUrlRef.current = result.previewUrl;
        selectedFileRef.current = result.file;
        imageMetaRef.current = result.meta;
        setPreviewUrl(result.previewUrl);
        setFileName(result.file.name);
        setIsHeic(result.isHeic);

        logClientScanEvent("file_ready", {
          filename: result.file.name,
          fileSize: result.file.size,
          mimeType: result.file.type || "(empty)",
          compressed: result.meta.compressed,
          originalSize: result.meta.originalSize,
          width: result.meta.width,
          height: result.meta.height,
        });
      } catch (processError) {
        setError(toUserFacingScanError(processError));
        resetToUpload();
      } finally {
        setIsProcessing(false);
        setBusyMessage(null);
      }
    },
    [revokePreviewUrl, resetToUpload]
  );

  const handleScan = useCallback(async () => {
    let file = selectedFileRef.current;

    if (!file) {
      setError("Please select a receipt image first.");
      return;
    }

    setError(null);
    setIsScanning(true);

    try {
      if (file.size > SAFE_UPLOAD_MAX_BYTES) {
        setBusyMessage("Optimising receipt image...");
        const { file: optimisedFile, meta } = await optimiseReceiptImage(file);
        selectedFileRef.current = optimisedFile;
        imageMetaRef.current = meta;
        file = optimisedFile;
      }

      setBusyMessage("Scanning receipt with AI…");

      const requestId = createScanRequestId();
      const meta = imageMetaRef.current;

      const extracted = await scanReceiptImage(file, {
        diagnostics: {
          requestId,
          filename: file.name,
          fileSize: file.size,
          mimeType: file.type || "(empty)",
          width: meta?.width,
          height: meta?.height,
          compressed: meta?.compressed ?? false,
          originalSize: meta?.originalSize,
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
        },
      });
      setIngredients(extracted);
      setStep("review");
    } catch (scanError) {
      setError(toUserFacingScanError(scanError));
    } finally {
      setIsScanning(false);
      setBusyMessage(null);
    }
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const openFilePicker = () => {
    if (!isProcessing && !isScanning) {
      inputRef.current?.click();
    }
  };

  useEffect(() => {
    if (handledPendingRef.current) {
      return;
    }
    handledPendingRef.current = true;
    const file = consumePendingFile();
    if (!file) {
      return;
    }
    // Defer so file handling is not a synchronous setState cascade in this effect.
    const timer = window.setTimeout(() => {
      void handleFile(file);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [consumePendingFile, handleFile]);

  useEffect(() => {
    return () => {
      revokePreviewUrl(previewUrlRef.current);
    };
  }, [revokePreviewUrl]);

  return (
    <div className="flex w-full flex-col gap-4">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_RECEIPT_INPUT}
        onChange={handleInputChange}
        className="sr-only"
        aria-label="Upload receipt image"
      />

      {step === "review" ? (
        <ReceiptIngredientReview
          initialIngredients={ingredients}
          storageLocations={storageLocations}
          categories={categories}
          onCancel={resetToUpload}
        />
      ) : step === "preview" && fileName ? (
        <ReceiptImagePreview
          previewUrl={previewUrl}
          fileName={fileName}
          isHeic={isHeic}
          isProcessing={isProcessing}
          isScanning={isScanning}
          busyMessage={busyMessage}
          onScan={() => void handleScan()}
          onReplace={openFilePicker}
          onRemove={resetToUpload}
        />
      ) : (
        <ReceiptUploadZone
          isDragging={isDragging}
          isProcessing={isProcessing}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={handleDrop}
          onClick={openFilePicker}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openFilePicker();
            }
          }}
        />
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
