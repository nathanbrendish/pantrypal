export const ACCEPTED_RECEIPT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/heif",
] as const;

export const ACCEPTED_RECEIPT_EXTENSIONS = [".jpg", ".jpeg", ".png", ".heic", ".heif"];

export const ACCEPTED_RECEIPT_INPUT =
  "image/jpeg,image/png,image/heic,image/heif,.heic,.heif";

export function isAcceptedReceiptImage(file: File): boolean {
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? "";

  return (
    ACCEPTED_RECEIPT_TYPES.includes(
      file.type.toLowerCase() as (typeof ACCEPTED_RECEIPT_TYPES)[number]
    ) || ACCEPTED_RECEIPT_EXTENSIONS.includes(extension)
  );
}

export function isHeicImage(file: File): boolean {
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? "";
  const type = file.type.toLowerCase();

  return (
    type === "image/heic" ||
    type === "image/heif" ||
    extension === ".heic" ||
    extension === ".heif"
  );
}

export async function processReceiptImage(file: File): Promise<{
  previewUrl: string;
  isHeic: boolean;
}> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    previewUrl: URL.createObjectURL(file),
    isHeic: isHeicImage(file),
  };
}
