"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isValidIngredientName,
  normalizeIngredientName,
} from "@/lib/ingredient-utils";
import { createClient } from "@/lib/supabase/server";
import { triggerShoppingListRegeneration } from "@/app/actions/shopping";
import type { PantryIngredientInput } from "@/types/pantry";

export type SaveScannedIngredientsResult =
  | {
      success: true;
      added: number;
      duplicates: number;
      scanned: number;
    }
  | {
      success: false;
      error: string;
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

export async function saveScannedIngredients(
  ingredients: PantryIngredientInput[]
): Promise<SaveScannedIngredientsResult> {
  const selected = ingredients
    .map((item) => ({
      ingredient_name: item.ingredient_name.trim(),
      quantity: item.quantity > 0 ? item.quantity : 1,
      unit: item.unit?.trim() || null,
      expiry_date: item.expiry_date || null,
    }))
    .filter((item) => isValidIngredientName(item.ingredient_name));

  if (selected.length === 0) {
    return {
      success: false,
      error: "Select at least one ingredient to save.",
    };
  }

  const { supabase, user } = await getAuthenticatedUser();

  const { data: existingItems, error: fetchError } = await supabase
    .from("pantry")
    .select("ingredient_name")
    .eq("user_id", user.id);

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  const existingNames = new Set(
    (existingItems ?? []).map((item) =>
      normalizeIngredientName(item.ingredient_name)
    )
  );

  const seenInBatch = new Set<string>();
  const toInsert: Array<{
    user_id: string;
    ingredient_name: string;
    quantity: number;
    unit: string | null;
    expiry_date: string | null;
    updated_at: string;
  }> = [];
  let duplicates = 0;

  for (const item of selected) {
    const normalized = normalizeIngredientName(item.ingredient_name);

    if (existingNames.has(normalized) || seenInBatch.has(normalized)) {
      duplicates++;
      continue;
    }

    seenInBatch.add(normalized);
    toInsert.push({
      user_id: user.id,
      ingredient_name: item.ingredient_name,
      quantity: item.quantity,
      unit: item.unit,
      expiry_date: item.expiry_date,
      updated_at: new Date().toISOString(),
    });
  }

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase.from("pantry").insert(toInsert);

    if (insertError) {
      return { success: false, error: insertError.message };
    }
  }

  await triggerShoppingListRegeneration();

  revalidatePath("/pantry");
  revalidatePath("/dashboard");
  revalidatePath("/meals");
  revalidatePath("/planner");
  revalidatePath("/shopping");

  return {
    success: true,
    added: toInsert.length,
    duplicates,
    scanned: selected.length,
  };
}
