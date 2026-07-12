"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidIngredientName } from "@/lib/ingredient-utils";
import {
  recordCommunityFoodObservation,
  resolveCommunityFood,
} from "@/lib/community-foods";
import {
  insertOrStackPantryItem,
  type PantryUpsertRow,
} from "@/lib/pantry-stacking";
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

type ScannedItem = {
  ingredient_name: string;
  quantity: number;
  unit: string | null;
  expiry_date: string | null;
  storage_location_id: string | null;
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
 * Records anonymous community learning and resolves a cache snapshot for the
 * pantry row. When the user picked a storage location in the review screen we
 * record it as a real community vote (matching manual add); otherwise we fall
 * back to the community-suggested location.
 */
async function enrichScannedItem(
  supabase: Awaited<ReturnType<typeof getAuthenticatedUser>>["supabase"],
  userId: string,
  item: ScannedItem
): Promise<PantryUpsertRow> {
  const base: PantryUpsertRow = {
    user_id: userId,
    ingredient_name: item.ingredient_name,
    quantity: item.quantity,
    unit: item.unit,
    expiry_date: item.expiry_date,
    updated_at: new Date().toISOString(),
    storage_location_id: item.storage_location_id,
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
      storageLocationId: item.storage_location_id,
    });

    const resolved = await resolveCommunityFood(supabase, item.ingredient_name);
    const canonicalId = resolved?.canonical_food_id ?? observation?.foodId ?? null;

    if (!canonicalId) {
      return base;
    }

    return {
      ...base,
      // Respect the user's explicit choice; only suggest when they left it blank.
      storage_location_id:
        item.storage_location_id ??
        resolved?.suggested_storage_location_id ??
        null,
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
  const selected: ScannedItem[] = ingredients
    .map((item) => ({
      ingredient_name: item.ingredient_name.trim(),
      quantity: item.quantity > 0 ? item.quantity : 1,
      unit: item.unit?.trim() || null,
      expiry_date: item.expiry_date || null,
      storage_location_id: item.storage_location_id ?? null,
    }))
    .filter((item) => isValidIngredientName(item.ingredient_name));

  if (selected.length === 0) {
    return {
      success: false,
      error: "Select at least one ingredient to save.",
    };
  }

  const { supabase, user } = await getAuthenticatedUser();

  let added = 0;
  let duplicates = 0;

  // Sequential so identical items in one batch stack onto each other instead
  // of racing to insert separate rows.
  for (const item of selected) {
    const row = await enrichScannedItem(supabase, user.id, item);
    const result = await insertOrStackPantryItem(supabase, row);

    if (result.status === "error") {
      return { success: false, error: result.error };
    }
    if (result.status === "stacked") {
      duplicates++;
    } else {
      added++;
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
    added,
    duplicates,
    scanned: selected.length,
  };
}
