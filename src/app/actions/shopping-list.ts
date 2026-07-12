"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { planMissingIngredientsForShoppingList } from "@/lib/add-missing-ingredients-core.mjs";
import {
  normalizeIngredientForMatch,
  parseIngredientRequirement,
} from "@/lib/ingredient-match";
import { buildFoodResolver } from "@/lib/food-resolver";
import { isValidIngredientName } from "@/lib/ingredient-utils";
import { matchesAnyPantry, type FoodResolver } from "@/lib/semantic-match";
import {
  insertShoppingListRows,
  type ShoppingListInsertRow,
} from "@/lib/shopping-list-persistence";
import { categorizeIngredient } from "@/lib/shopping-utils";
import { createClient } from "@/lib/supabase/server";

export type AddMissingIngredientsResult = {
  added: number;
  skippedExisting: number;
  skippedPantry: number;
};

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

function ingredientInPantry(
  name: string,
  pantryNames: string[],
  resolver?: FoodResolver | null
): boolean {
  return matchesAnyPantry(name, pantryNames, resolver);
}

export async function addMissingIngredientsToShoppingList(
  ingredients: string[]
): Promise<AddMissingIngredientsResult> {
  const { supabase, user } = await getAuthenticatedUser();

  const uniqueIngredients = new Map<string, string>();

  for (const raw of ingredients) {
    const trimmed = raw.trim();
    if (!isValidIngredientName(trimmed)) {
      continue;
    }

    const parsed = parseIngredientRequirement(trimmed);
    if (!isValidIngredientName(parsed.name)) {
      continue;
    }

    const key = normalizeIngredientForMatch(parsed.name);
    if (!uniqueIngredients.has(key)) {
      uniqueIngredients.set(key, trimmed);
    }
  }

  if (uniqueIngredients.size === 0) {
    return { added: 0, skippedExisting: 0, skippedPantry: 0 };
  }

  const [{ data: pantry }, { data: existingItems }] = await Promise.all([
    supabase
      .from("pantry")
      .select("ingredient_name")
      .eq("user_id", user.id),
    supabase
      .from("shopping_list_items")
      .select("ingredient_name")
      .eq("user_id", user.id),
  ]);

  const pantryNames = (pantry ?? []).map((item) => item.ingredient_name);
  const resolver = await buildFoodResolver(supabase, [
    ...uniqueIngredients.values(),
    ...pantryNames,
  ]);

  const plan = planMissingIngredientsForShoppingList({
    ingredients: [...uniqueIngredients.values()],
    pantryNames,
    existingShoppingNames: (existingItems ?? []).map(
      (item) => item.ingredient_name
    ),
    userId: user.id,
    normalizeKey: normalizeIngredientForMatch,
    parseIngredient: parseIngredientRequirement,
    isInPantry: (ingredient: string, names: string[]) =>
      ingredientInPantry(ingredient, names, resolver),
    categorizeIngredient,
  });

  if (plan.toInsert.length > 0) {
    const rows: ShoppingListInsertRow[] = plan.toInsert.map((row) => ({
      ...row,
      source: "manual" as const,
    }));
    await insertShoppingListRows(supabase, rows);
  }

  revalidatePath("/shopping");
  revalidatePath("/dashboard");
  revalidatePath("/planner");
  revalidatePath("/meals");
  revalidatePath("/saved-meals");
  revalidatePath("/recipes");

  return {
    added: plan.added,
    skippedExisting: plan.skippedExisting,
    skippedPantry: plan.skippedPantry,
  };
}
