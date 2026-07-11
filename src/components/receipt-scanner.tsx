"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ReceiptImagePreview } from "@/components/receipt-image-preview";
import { ReceiptIngredientReview } from "@/components/receipt-ingredient-review";
import { ReceiptUploadZone } from "@/components/receipt-upload-zone";
import {
  ACCEPTED_RECEIPT_INPUT,
  isAcceptedReceiptImage,
  processReceiptImage,
} from "@/lib/receipt-image";
import { useReceiptDrop } from "@/lib/receipt-drop-context";
import { scanReceiptImage } from "@/lib/scan-receipt-client";
import type { ScannedIngredient } from "@/types/v2";

type ScannerStep = "upload" | "preview" | "review";

export function ReceiptScanner() {
  const { pendingFile, consumePendingFile } = useReceiptDrop();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const selectedFileRef = useRef<File | null>(null);

  const [step, setStep] = useState<ScannerStep>("upload");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isHeic, setIsHeic] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
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
    setPreviewUrl(null);
    setFileName(null);
    setIsHeic(false);
    setError(null);
    setIngredients([]);
    setStep("upload");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [revokePreviewUrl]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!isAcceptedReceiptImage(file)) {
        setError("Please upload a JPG, PNG or HEIC image.");
        return;
      }

      setError(null);
      setIngredients([]);
      setStep("preview");
      setIsProcessing(true);

      revokePreviewUrl(previewUrlRef.current);

      try {
        const result = await processReceiptImage(file);
        previewUrlRef.current = result.previewUrl;
        selectedFileRef.current = file;
        setPreviewUrl(result.previewUrl);
        setFileName(file.name);
        setIsHeic(result.isHeic);
      } catch {
        setError("Something went wrong while processing your image.");
        resetToUpload();
      } finally {
        setIsProcessing(false);
      }
    },
    [revokePreviewUrl, resetToUpload]
  );

  const handleScan = useCallback(async () => {
    const file = selectedFileRef.current;

    if (!file) {
      setError("Please select a receipt image first.");
      return;
    }

    setError(null);
    setIsScanning(true);

    try {
      const extracted = await scanReceiptImage(file);
      setIngredients(extracted);
      setStep("review");
    } catch (scanError) {
      setError(
        scanError instanceof Error
          ? scanError.message
          : "Failed to scan receipt. Please try again."
      );
    } finally {
      setIsScanning(false);
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
    const file = consumePendingFile();
    if (file) {
      void handleFile(file);
    }
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
          onCancel={resetToUpload}
        />
      ) : step === "preview" && fileName ? (
        <ReceiptImagePreview
          previewUrl={previewUrl}
          fileName={fileName}
          isHeic={isHeic}
          isProcessing={isProcessing}
          isScanning={isScanning}
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
