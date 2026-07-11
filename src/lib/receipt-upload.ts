import {
  ACCEPTED_RECEIPT_EXTENSIONS,
  ACCEPTED_RECEIPT_TYPES,
} from "@/lib/receipt-image";

const MAX_RECEIPT_SIZE_BYTES = 10 * 1024 * 1024;

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

export function validateReceiptUpload(file: File): string | null {
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? "";
  const mimeType = file.type.toLowerCase();

  const isValidType =
    ACCEPTED_RECEIPT_TYPES.includes(
      mimeType as (typeof ACCEPTED_RECEIPT_TYPES)[number]
    ) || ACCEPTED_RECEIPT_EXTENSIONS.includes(extension);

  if (!isValidType) {
    return "Please upload a JPG, PNG or HEIC image.";
  }

  if (file.size > MAX_RECEIPT_SIZE_BYTES) {
    return "Image must be smaller than 10MB.";
  }

  return null;
}

export async function fileToBase64(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString("base64");
}
