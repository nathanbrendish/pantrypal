import {
  ACCEPTED_RECEIPT_EXTENSIONS,
  ACCEPTED_RECEIPT_TYPES,
  SAFE_UPLOAD_MAX_BYTES,
} from "@/lib/receipt-image";
import { SCAN_ERROR_CODES, SCAN_USER_MESSAGES } from "@/lib/scan-receipt-errors";

/** Server-side cap aligned with safe client upload target (+ small multipart slack). */
export const MAX_RECEIPT_SIZE_BYTES = SAFE_UPLOAD_MAX_BYTES;

export type ReceiptValidationResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
      code:
        | typeof SCAN_ERROR_CODES.UNSUPPORTED_FORMAT
        | typeof SCAN_ERROR_CODES.FILE_TOO_LARGE
        | typeof SCAN_ERROR_CODES.VALIDATION;
    };

export function getReceiptMimeType(file: File): string {
  if (file.type) {
    return file.type.toLowerCase();
  }

  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? "";

  switch (extension) {
    case ".png":
      return "image/png";
    case ".heic":
      return "image/heic";
    case ".heif":
      return "image/heif";
    default:
      return "image/jpeg";
  }
}

export function validateReceiptUpload(file: File): ReceiptValidationResult {
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? "";
  const mimeType = file.type.toLowerCase();

  const isValidType =
    ACCEPTED_RECEIPT_TYPES.includes(
      mimeType as (typeof ACCEPTED_RECEIPT_TYPES)[number]
    ) || ACCEPTED_RECEIPT_EXTENSIONS.includes(extension);

  if (!isValidType) {
    return {
      ok: false,
      message: SCAN_USER_MESSAGES.UNSUPPORTED_FORMAT,
      code: SCAN_ERROR_CODES.UNSUPPORTED_FORMAT,
    };
  }

  if (file.size > MAX_RECEIPT_SIZE_BYTES) {
    return {
      ok: false,
      message: SCAN_USER_MESSAGES.FILE_TOO_LARGE,
      code: SCAN_ERROR_CODES.FILE_TOO_LARGE,
    };
  }

  if (file.size <= 0) {
    return {
      ok: false,
      message: SCAN_USER_MESSAGES.VALIDATION,
      code: SCAN_ERROR_CODES.VALIDATION,
    };
  }

  return { ok: true };
}

export async function fileToBase64(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString("base64");
}
