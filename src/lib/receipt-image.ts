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

/**
 * Absolute reject threshold before we attempt client-side optimisation.
 * Phone camera HEIC/JPEG files are often 5–12MB.
 */
export const MAX_RECEIPT_INPUT_BYTES = 20 * 1024 * 1024;

/**
 * Target upload size — must stay under Vercel’s ~4.5MB serverless body limit
 * (multipart overhead included).
 */
export const SAFE_UPLOAD_MAX_BYTES = 3.5 * 1024 * 1024;

/** Longest edge after optimisation. */
export const MAX_RECEIPT_DIMENSION = 2048;

export type ReceiptImageMeta = {
  width?: number;
  height?: number;
  compressed: boolean;
  originalSize: number;
};

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

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode receipt image for optimisation."));
    };

    image.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not encode optimised receipt image."));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
}

/**
 * Resize/re-encode JPEG/PNG (and browser-decodable images) to stay under the
 * safe upload limit. HEIC that cannot be decoded is returned as-is when small
 * enough; oversized undecodable HEIC fails with a friendly error.
 */
export async function optimiseReceiptImage(file: File): Promise<{
  file: File;
  meta: ReceiptImageMeta;
}> {
  const originalSize = file.size;

  if (file.size > MAX_RECEIPT_INPUT_BYTES) {
    throw new Error("The receipt image is too large.");
  }

  if (file.size <= SAFE_UPLOAD_MAX_BYTES && !needsForcedDownscale(file)) {
    // Still try to read dimensions for diagnostics when possible.
    let width: number | undefined;
    let height: number | undefined;

    try {
      const image = await loadImageFromFile(file);
      width = image.naturalWidth;
      height = image.naturalHeight;
    } catch {
      // HEIC / undecodable — dimensions unavailable.
    }

    return {
      file,
      meta: { width, height, compressed: false, originalSize },
    };
  }

  let image: HTMLImageElement;

  try {
    image = await loadImageFromFile(file);
  } catch {
    if (isHeicImage(file) && file.size > SAFE_UPLOAD_MAX_BYTES) {
      throw new Error(
        "This HEIC image is too large to upload. Please export it as JPEG or PNG and try again."
      );
    }

    if (file.size > SAFE_UPLOAD_MAX_BYTES) {
      throw new Error("The receipt image is too large.");
    }

    return {
      file,
      meta: { compressed: false, originalSize },
    };
  }

  const { width, height } = fitWithinMaxDimension(
    image.naturalWidth,
    image.naturalHeight,
    MAX_RECEIPT_DIMENSION
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("We couldn't upload the image.");
  }

  context.drawImage(image, 0, 0, width, height);

  const outputType = "image/jpeg";
  let quality = 0.85;
  let blob = await canvasToBlob(canvas, outputType, quality);

  while (blob.size > SAFE_UPLOAD_MAX_BYTES && quality > 0.45) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, outputType, quality);
  }

  if (blob.size > SAFE_UPLOAD_MAX_BYTES) {
    // Further shrink dimensions if quality floor still exceeds limit.
    let scale = 0.85;
    while (blob.size > SAFE_UPLOAD_MAX_BYTES && scale > 0.4) {
      const nextWidth = Math.max(1, Math.round(width * scale));
      const nextHeight = Math.max(1, Math.round(height * scale));
      canvas.width = nextWidth;
      canvas.height = nextHeight;
      context.drawImage(image, 0, 0, nextWidth, nextHeight);
      blob = await canvasToBlob(canvas, outputType, 0.7);
      scale -= 0.1;
    }
  }

  if (blob.size > SAFE_UPLOAD_MAX_BYTES) {
    throw new Error("The receipt image is too large.");
  }

  const optimisedName = file.name.replace(/\.[^.]+$/i, "") + ".jpg";
  const optimisedFile = new File([blob], optimisedName, {
    type: outputType,
    lastModified: Date.now(),
  });

  return {
    file: optimisedFile,
    meta: {
      width: canvas.width,
      height: canvas.height,
      compressed: true,
      originalSize,
    },
  };
}

function needsForcedDownscale(file: File): boolean {
  // Always attempt decode+check for very large pixel images is expensive;
  // size gate above is enough. Reserved for future EXIF-based heuristics.
  void file;
  return false;
}

function fitWithinMaxDimension(
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } {
  const longest = Math.max(width, height);

  if (longest <= maxDimension) {
    return { width, height };
  }

  const scale = maxDimension / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export async function processReceiptImage(file: File): Promise<{
  previewUrl: string;
  isHeic: boolean;
  file: File;
  meta: ReceiptImageMeta;
}> {
  const { file: optimisedFile, meta } = await optimiseReceiptImage(file);

  return {
    previewUrl: URL.createObjectURL(optimisedFile),
    isHeic: isHeicImage(optimisedFile) || (isHeicImage(file) && !meta.compressed),
    file: optimisedFile,
    meta,
  };
}
