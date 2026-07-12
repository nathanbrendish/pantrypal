import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeIngredientForMatch } from "@/lib/ingredient-match";
import {
  EMPTY_FOOD_RESOLVER,
  type FoodResolver,
  type ResolvedFood,
} from "@/lib/semantic-match";

type ResolverRpcClient = Pick<SupabaseClient, "rpc" | "from">;

type ResolveRow = {
  input_name: string;
  canonical_food_id: string | null;
  food_subcategory_id: string | null;
};

/**
 * Projects the Food Knowledge Graph onto a specific set of ingredient/pantry
 * names in a single round-trip, plus the set of subcategories flagged as
 * interchangeable families. The result is a plain serialisable object that can
 * be passed from Server Components down to Client Components.
 */
export async function buildFoodResolver(
  supabase: ResolverRpcClient,
  names: Array<string | null | undefined>
): Promise<FoodResolver> {
  const uniqueNames = Array.from(
    new Set(
      names
        .map((name) => name?.trim())
        .filter((name): name is string => Boolean(name))
    )
  );

  if (uniqueNames.length === 0) {
    return EMPTY_FOOD_RESOLVER;
  }

  const [resolveResult, subcategoryResult] = await Promise.all([
    supabase.rpc("resolve_community_foods", { search_names: uniqueNames }),
    supabase
      .from("food_subcategories")
      .select("id")
      .eq("substitutable", true),
  ]);

  if (resolveResult.error) {
    // Matching must degrade gracefully to string comparison, never throw.
    return EMPTY_FOOD_RESOLVER;
  }

  const byName: Record<string, ResolvedFood> = {};
  for (const row of (resolveResult.data ?? []) as ResolveRow[]) {
    if (!row.canonical_food_id && !row.food_subcategory_id) {
      continue;
    }
    byName[normalizeIngredientForMatch(row.input_name)] = {
      canonicalId: row.canonical_food_id,
      subcategoryId: row.food_subcategory_id,
    };
  }

  const substitutableSubcategoryIds = (
    (subcategoryResult.data ?? []) as Array<{ id: string }>
  ).map((row) => row.id);

  return { byName, substitutableSubcategoryIds };
}
