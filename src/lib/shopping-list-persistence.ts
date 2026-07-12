import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

type ShoppingPersistenceClient = Pick<SupabaseClient, "from">;

export const SHOPPING_LIST_SELECT =
  "id, ingredient_name, quantity, unit, category, checked, needed_for_meals, shortage_label, demand_quantity, demand_unit, pantry_quantity, pantry_unit, used_by_meals, source";

export type ShoppingListInsertRow = {
  user_id: string;
  ingredient_name: string;
  quantity: number | null;
  unit: string | null;
  category: string;
  checked: boolean;
  needed_for_meals: number;
  shortage_label: string | null;
  demand_quantity: number | null;
  demand_unit: string | null;
  pantry_quantity: number | null;
  pantry_unit: string | null;
  used_by_meals: string[];
  source: "manual" | "meal_plan";
};

export async function insertShoppingListRows(
  supabase: ShoppingPersistenceClient,
  rows: ShoppingListInsertRow[]
) {
  if (rows.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("shopping_list_items")
    .insert(rows)
    .select(SHOPPING_LIST_SELECT);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
