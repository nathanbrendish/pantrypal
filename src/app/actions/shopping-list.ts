"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ingredientsMatch,
  normalizeIngredientForMatch,
} from "@/lib/ingredient-match";
import { isValidIngredientName } from "@/lib/ingredient-utils";
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
  pantryNames: string[]
): boolean {
  return pantryNames.some((pantryName) =>
    ingredientsMatch(name, pantryName)
  );
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

    const key = normalizeIngredientForMatch(trimmed);
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
  const existingShoppingKeys = new Set(
    (existingItems ?? []).map((item) =>
      normalizeIngredientForMatch(item.ingredient_name)
    )
  );

  const toInsert: Array<{
    user_id: string;
    ingredient_name: string;
    quantity: null;
    unit: null;
    category: string;
    checked: boolean;
  }> = [];

  let skippedPantry = 0;
  let skippedExisting = 0;

  for (const ingredient of uniqueIngredients.values()) {
    const key = normalizeIngredientForMatch(ingredient);

    if (ingredientInPantry(ingredient, pantryNames)) {
      skippedPantry++;
      continue;
    }

    if (existingShoppingKeys.has(key)) {
      skippedExisting++;
      continue;
    }

    toInsert.push({
      user_id: user.id,
      ingredient_name: ingredient,
      quantity: null,
      unit: null,
      category: categorizeIngredient(ingredient),
      checked: false,
    });

    existingShoppingKeys.add(key);
  }

  if (toInsert.length > 0) {
    const { error } = await supabase
      .from("shopping_list_items")
      .insert(toInsert);

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath("/shopping");
  revalidatePath("/dashboard");
  revalidatePath("/planner");
  revalidatePath("/meals");
  revalidatePath("/saved-meals");
  revalidatePath("/recipes");

  return {
    added: toInsert.length,
    skippedExisting,
    skippedPantry,
  };
}
