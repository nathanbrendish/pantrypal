import type { PantryIngredientInput } from "@/types/pantry";
export { categorizeIngredient } from "@/lib/pantry-categories";

export function formatQuantity(
  quantity: number | null,
  unit: string | null
): string {
  if (quantity === null) return "";
  if (!unit) return String(quantity);
  return `${quantity} ${unit}`;
}
