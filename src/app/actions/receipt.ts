"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isValidIngredientName,
  normalizeIngredientName,
} from "@/lib/ingredient-utils";
import {
  recordCommunityFoodObservation,
  resolveCommunityFood,
} from "@/lib/community-foods";
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

type ScannedInsertRow = {
  user_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string | null;
  expiry_date: string | null;
  updated_at: string;
  storage_location_id: string | null;
  canonical_food_id: string | null;
  cached_category_id: string | null;
  cached_subcategory_id: string | null;
  classification_version: number | null;
  classification_updated_at: string | null;
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

function getShelfLifeDays(expiryDate: string | null): number | null {
  if (!expiryDate) {
    return null;
  }
  const expiry = new Date(`${expiryDate}T00:00:00`);
  if (Number.isNaN(expiry.getTime())) {
    return null;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((expiry.getTime() - today.getTime()) / 86_400_000));
}

/**
 * Records anonymous community learning (without a storage vote, since scanned
 * items get an auto-suggested location the user has not confirmed) and resolves
 * a cache snapshot + suggested storage location for the pantry row.
 */
async function enrichScannedItem(
  supabase: Awaited<ReturnType<typeof getAuthenticatedUser>>["supabase"],
  userId: string,
  item: { ingredient_name: string; quantity: number; unit: string | null; expiry_date: string | null }
): Promise<ScannedInsertRow> {
  const base: ScannedInsertRow = {
    user_id: userId,
    ingredient_name: item.ingredient_name,
    quantity: item.quantity,
    unit: item.unit,
    expiry_date: item.expiry_date,
    updated_at: new Date().toISOString(),
    storage_location_id: null,
    canonical_food_id: null,
    cached_category_id: null,
    cached_subcategory_id: null,
    classification_version: null,
    classification_updated_at: null,
  };

  try {
    const observation = await recordCommunityFoodObservation(supabase, {
      name: item.ingredient_name,
      unit: item.unit,
      shelfLifeDays: getShelfLifeDays(item.expiry_date),
    });

    const resolved = await resolveCommunityFood(supabase, item.ingredient_name);
    const canonicalId = resolved?.canonical_food_id ?? observation?.foodId ?? null;

    if (!canonicalId) {
      return base;
    }

    return {
      ...base,
      storage_location_id: resolved?.suggested_storage_location_id ?? null,
      canonical_food_id: canonicalId,
      cached_category_id: resolved?.food_category_id ?? null,
      cached_subcategory_id: resolved?.food_subcategory_id ?? null,
      classification_version:
        resolved?.classification_version ?? observation?.version ?? null,
      classification_updated_at: new Date().toISOString(),
    };
  } catch {
    return base;
  }
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
  const deduped: typeof selected = [];
  let duplicates = 0;

  for (const item of selected) {
    const normalized = normalizeIngredientName(item.ingredient_name);
    if (existingNames.has(normalized) || seenInBatch.has(normalized)) {
      duplicates++;
      continue;
    }
    seenInBatch.add(normalized);
    deduped.push(item);
  }

  let added = 0;

  if (deduped.length > 0) {
    const toInsert = await Promise.all(
      deduped.map((item) => enrichScannedItem(supabase, user.id, item))
    );

    const { error: insertError } = await supabase.from("pantry").insert(toInsert);

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    added = toInsert.length;
  }

  await triggerShoppingListRegeneration();

  revalidatePath("/pantry");
  revalidatePath("/dashboard");
  revalidatePath("/meals");
  revalidatePath("/planner");
  revalidatePath("/shopping");

  return {
    success: true,
    added,
    duplicates,
    scanned: selected.length,
  };
}
