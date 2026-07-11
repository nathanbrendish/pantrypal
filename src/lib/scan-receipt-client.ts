import type { ScanReceiptErrorResponse, ScanReceiptResponse } from "@/lib/gemini/receipt-prompt";
import type { ScannedIngredient } from "@/types/v2";

export async function scanReceiptImage(file: File): Promise<ScannedIngredient[]> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/scan-receipt", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as
    | ScanReceiptResponse
    | ScanReceiptErrorResponse;

  if (!response.ok) {
    throw new Error(
      "error" in data && data.error
        ? data.error
        : "Failed to scan receipt. Please try again."
    );
  }

  if (!("ingredients" in data) || !Array.isArray(data.ingredients)) {
    throw new Error("Invalid response from receipt scanner.");
  }

  return data.ingredients;
}
