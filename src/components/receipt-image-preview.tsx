"use client";

import { useState } from "react";
import { FileImage, Loader2, ScanLine, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ReceiptImagePreviewProps = {
  previewUrl: string | null;
  fileName: string;
  isHeic: boolean;
  isProcessing: boolean;
  isScanning: boolean;
  busyMessage?: string | null;
  onScan: () => void;
  onReplace: () => void;
  onRemove: () => void;
};

export function ReceiptImagePreview({
  previewUrl,
  fileName,
  isHeic,
  isProcessing,
  isScanning,
  busyMessage,
  onScan,
  onReplace,
  onRemove,
}: ReceiptImagePreviewProps) {
  const [failedPreviewUrl, setFailedPreviewUrl] = useState<string | null>(null);

  const isBusy = isProcessing || isScanning;
  const statusLabel =
    busyMessage ||
    (isScanning ? "Scanning receipt with AI…" : "Processing image…");

  return (
    <Card className="overflow-hidden p-6">
      <div className="flex flex-col gap-6">
        <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
          {isBusy ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <Loader2
                className="h-10 w-10 animate-spin text-primary"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-muted">
                {statusLabel}
              </p>
            </div>
          ) : previewUrl && failedPreviewUrl !== previewUrl ? (
            // Local blob/object URLs — next/image is not suitable here.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={`Receipt preview: ${fileName}`}
              className="max-h-[480px] w-full object-contain"
              onError={() => {
                setFailedPreviewUrl(previewUrl);
              }}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <FileImage
                className="h-12 w-12 text-zinc-400 dark:text-zinc-500"
                aria-hidden="true"
              />
              <p className="font-medium text-foreground">
                {fileName}
              </p>
              <p className="max-w-sm text-sm text-muted">
                {isHeic || failedPreviewUrl === previewUrl
                  ? "HEIC preview may not be available in this browser, but your file was selected successfully."
                  : "Preview unavailable."}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={onScan}
            disabled={isBusy}
            className="h-12 w-full gap-2 sm:w-auto sm:self-start"
          >
            <ScanLine className="h-4 w-4" aria-hidden="true" />
            Scan Receipt
          </Button>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={onReplace}
              disabled={isBusy}
              className="gap-2"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Replace image
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={onRemove}
              disabled={isBusy}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Remove image
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
