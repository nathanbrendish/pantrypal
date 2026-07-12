import type { ScannedIngredient } from "@/types/v2";
import type { ScanReceiptResponse } from "@/lib/gemini/receipt-prompt";

function parseIngredient(value: unknown): ScannedIngredient | null {
  if (typeof value === "string" && value.trim()) {
    return {
      ingredient_name: value.trim(),
      quantity: 1,
      unit: null,
    };
  }

  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (
    typeof record.ingredient_name !== "string" ||
    !record.ingredient_name.trim()
  ) {
    return null;
  }

  const quantity =
    typeof record.quantity === "number" && record.quantity > 0
      ? record.quantity
      : 1;

  const unit =
    typeof record.unit === "string" && record.unit.trim()
      ? record.unit.trim()
      : null;

  return {
    ingredient_name: record.ingredient_name.trim(),
    quantity,
    unit,
  };
}

export function parseIngredientsResponse(text: string): ScannedIngredient[] {
  const trimmed = text.trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(trimmed);
  } catch {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Could not parse ingredient response from AI.");
    }

    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error("Could not parse ingredient response from AI.");
    }
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("ingredients" in parsed) ||
    !Array.isArray((parsed as ScanReceiptResponse).ingredients)
  ) {
    throw new Error("AI response did not include a valid ingredients list.");
  }

  const ingredients = (parsed as ScanReceiptResponse).ingredients
    .map(parseIngredient)
    .filter((item): item is ScannedIngredient => item !== null);

  const unique = new Map<string, ScannedIngredient>();

  for (const item of ingredients) {
    const key = item.ingredient_name.toLowerCase();
    if (!unique.has(key)) {
      unique.set(key, item);
    }
  }

  return [...unique.values()];
}
