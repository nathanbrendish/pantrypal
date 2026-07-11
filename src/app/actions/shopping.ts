"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { normalizeIngredientForMatch } from "@/lib/ingredient-match";
import {
  buildShoppingSummary,
  computeShoppingList,
  type ShoppingListSummary,
} from "@/lib/shopping-list";
import { createClient } from "@/lib/supabase/server";
import type { MealPlanItem, ShoppingListItem } from "@/types/v2";

export type ShoppingActionResult =
  | { success: true }
  | { success: false; error: string };

export type ShoppingListResult = {
  items: ShoppingListItem[];
  summary: ShoppingListSummary;
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

async function fetchActivePlanItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<MealPlanItem[]> {
  const { data: plans } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  const plan = plans?.[0];
  if (!plan) {
    return [];
  }

  const { data: items } = await supabase
    .from("meal_plan_items")
    .select(
      "id, day_index, sort_order, meal_name, description, ingredients_used, missing_ingredients"
    )
    .eq("plan_id", plan.id)
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  return (items ?? []).map((item) => ({
    id: item.id,
    day_index: item.day_index,
    sort_order: item.sort_order,
    meal_name: item.meal_name,
    description: item.description,
    ingredients_used: item.ingredients_used as string[],
    missing_ingredients: item.missing_ingredients as string[],
  }));
}

/**
 * Recomputes the shopping list from the active meal plan and pantry,
 * persists it to shopping_list_items, and preserves checkbox state.
 */
export async function regenerateShoppingList(): Promise<ShoppingListResult> {
  const { supabase, user } = await getAuthenticatedUser();

  const [planItems, pantryResult, existingItems] = await Promise.all([
    fetchActivePlanItems(supabase, user.id),
    supabase
      .from("pantry")
      .select("ingredient_name, quantity, unit")
      .eq("user_id", user.id),
    supabase
      .from("shopping_list_items")
      .select("ingredient_name, checked")
      .eq("user_id", user.id),
  ]);

  const pantry = (pantryResult.data ?? []).map((item) => ({
    ingredient_name: item.ingredient_name,
    quantity: Number(item.quantity) || 0,
    unit: item.unit,
  }));

  const checkedByName = new Map(
    (existingItems.data ?? []).map((item) => [
      normalizeIngredientForMatch(item.ingredient_name),
      item.checked,
    ])
  );

  const computed = computeShoppingList(planItems, pantry);
  const summary = buildShoppingSummary(computed, planItems.length > 0);

  await supabase.from("shopping_list_items").delete().eq("user_id", user.id);

  if (computed.length > 0) {
    const rows = computed.map((item) => ({
      user_id: user.id,
      ingredient_name: item.ingredient_name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      checked:
        checkedByName.get(
          normalizeIngredientForMatch(item.ingredient_name)
        ) ?? false,
    }));

    const { data: persisted, error } = await supabase
      .from("shopping_list_items")
      .insert(rows)
      .select("id, ingredient_name, quantity, unit, category, checked");

    if (error) {
      throw new Error(error.message);
    }

    const computedByName = new Map(
      computed.map((item) => [
        normalizeIngredientForMatch(item.ingredient_name),
        item,
      ])
    );

    return {
      items: (persisted ?? []).map((item) => {
        const meta = computedByName.get(
          normalizeIngredientForMatch(item.ingredient_name)
        );
        return {
          id: item.id,
          ingredient_name: item.ingredient_name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          checked: item.checked,
          needed_for_meals: meta?.needed_for_meals ?? 1,
          shortage_label: meta?.shortage_label ?? null,
        };
      }),
      summary,
    };
  }

  return { items: [], summary };
}

export async function getShoppingList(): Promise<ShoppingListResult> {
  return regenerateShoppingList();
}

export async function toggleShoppingItem(
  id: string,
  checked: boolean
): Promise<ShoppingActionResult> {
  const { supabase, user } = await getAuthenticatedUser();

  const { error } = await supabase
    .from("shopping_list_items")
    .update({ checked })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/shopping");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function clearCheckedItems(): Promise<ShoppingActionResult> {
  const { supabase, user } = await getAuthenticatedUser();

  const { error } = await supabase
    .from("shopping_list_items")
    .delete()
    .eq("user_id", user.id)
    .eq("checked", true);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/shopping");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function triggerShoppingListRegeneration(): Promise<void> {
  await regenerateShoppingList();
  revalidatePath("/shopping");
  revalidatePath("/dashboard");
}
