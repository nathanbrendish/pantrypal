import { ingredientsMatch, normalizeIngredientForMatch } from "@/lib/ingredient-match";

/**
 * A food resolved against the Food Knowledge Graph. `null` fields mean the
 * graph has no confident answer for that name (so callers fall back to string
 * matching).
 */
export type ResolvedFood = {
  canonicalId: string | null;
  subcategoryId: string | null;
};

/**
 * A serialisable projection of the Food Knowledge Graph onto the exact strings
 * currently in play (recipe ingredients + pantry names). Built once on the
 * server (see `buildFoodResolver`) and safe to pass to Client Components.
 *
 * `byName` is keyed by `normalizeIngredientForMatch(name)`.
 */
export type FoodResolver = {
  byName: Record<string, ResolvedFood>;
  substitutableSubcategoryIds: string[];
};

export const EMPTY_FOOD_RESOLVER: FoodResolver = {
  byName: {},
  substitutableSubcategoryIds: [],
};

function resolveName(
  name: string,
  resolver: FoodResolver | null | undefined
): ResolvedFood | null {
  if (!resolver) {
    return null;
  }
  return resolver.byName[normalizeIngredientForMatch(name)] ?? null;
}

/**
 * The single semantic-matching primitive shared by recipe matching and shopping
 * list generation.
 *
 * Resolution order (Food Knowledge Graph first, string only as fallback):
 *   1. Same canonical food  -> match (exact identity).
 *   2. Same food subcategory AND that subcategory is substitutable -> match
 *      (ingredient family, e.g. Pasta covers Macaroni).
 *   3. Neither side is in the graph on at least one axis -> fall back to the
 *      existing normalized/substring string match.
 */
export function foodsMatch(
  requiredName: string,
  pantryName: string,
  resolver?: FoodResolver | null
): boolean {
  const required = resolveName(requiredName, resolver);
  const pantry = resolveName(pantryName, resolver);

  if (required?.canonicalId && pantry?.canonicalId) {
    if (required.canonicalId === pantry.canonicalId) {
      return true;
    }

    if (
      required.subcategoryId &&
      required.subcategoryId === pantry.subcategoryId &&
      resolver?.substitutableSubcategoryIds.includes(required.subcategoryId)
    ) {
      return true;
    }

    // Both sides are known distinct foods that are not an interchangeable
    // family: they genuinely differ, so do not fall through to fuzzy string
    // matching (which could produce false positives like "beef" ~ "beef mince").
    return false;
  }

  // At least one side is unknown to the graph -> fall back to string matching.
  return ingredientsMatch(requiredName, pantryName);
}

/**
 * Returns true when `name` matches any of the provided pantry names, using the
 * semantic matcher.
 */
export function matchesAnyPantry(
  name: string,
  pantryNames: string[],
  resolver?: FoodResolver | null
): boolean {
  return pantryNames.some((pantryName) => foodsMatch(name, pantryName, resolver));
}
