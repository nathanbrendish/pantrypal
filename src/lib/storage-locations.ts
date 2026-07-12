import type { FoodCategory, StorageLocation } from "@/types/taxonomy";

/**
 * Fallback mapping from a food category name to a sensible storage-location
 * name. This is only a last-resort default when the community has not yet
 * learned a storage suggestion for a food. Storage location always remains
 * user-owned; this never overrides an explicit user choice.
 */
const CATEGORY_TO_STORAGE_FALLBACK: Record<string, string> = {
  Dairy: "Fridge",
  Meat: "Fridge",
  Seafood: "Fridge",
  Fruit: "Fridge",
  Vegetables: "Fridge",
  "Frozen Foods": "Freezer",
  Bakery: "Cupboard",
  "Pasta & Rice": "Cupboard",
  "Herbs & Spices": "Cupboard",
  "Pantry Staples": "Cupboard",
  "Condiments & Sauces": "Cupboard",
  "Oils & Vinegars": "Cupboard",
  "Tinned & Jarred Foods": "Cupboard",
  Snacks: "Cupboard",
  Confectionery: "Cupboard",
  Baking: "Cupboard",
  Beverages: "Drinks Cabinet",
};

/**
 * Suggests a storage location id for a given (optional) category, using the
 * fallback map. Returns null when nothing sensible can be suggested so the UI
 * can leave the field empty rather than guessing.
 */
export function suggestStorageLocationId(
  categoryName: string | null | undefined,
  locations: StorageLocation[]
): string | null {
  if (!categoryName) {
    return null;
  }

  const targetName = CATEGORY_TO_STORAGE_FALLBACK[categoryName];
  if (!targetName) {
    return null;
  }

  return locations.find((location) => location.name === targetName)?.id ?? null;
}

export function findCategoryName(
  categoryId: string | null | undefined,
  categories: FoodCategory[]
): string | null {
  if (!categoryId) {
    return null;
  }
  return categories.find((category) => category.id === categoryId)?.name ?? null;
}
