import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { buildFoodResolver } from "@/lib/food-resolver";
import { unitsAreCompatible } from "@/lib/ingredient-match";
import { foodsMatch } from "@/lib/semantic-match";

type ConsumptionClient = Pick<SupabaseClient, "from" | "rpc">;

export type CookingUsageInput = {
  expectedIngredient: string | null;
  actualIngredient: string;
  expectedQuantity: number | null;
  expectedUnit: string | null;
  actualQuantity: number;
  actualUnit: string | null;
};

export type CompleteCookingInput = {
  userId: string;
  recipeId?: string | null;
  recipeName: string;
  ingredients: CookingUsageInput[];
};

type PantryRow = {
  id: string;
  ingredient_name: string;
  quantity: number | null;
  unit: string | null;
};

function observationAction(item: CookingUsageInput) {
  if (item.actualQuantity <= 0) return "skipped";
  if (!item.expectedIngredient) return "extra";
  if (
    item.expectedIngredient.trim().toLowerCase() !==
    item.actualIngredient.trim().toLowerCase()
  ) {
    return "substituted";
  }
  return "used";
}

async function deductIngredientFromPantry(
  supabase: ConsumptionClient,
  userId: string,
  pantryRows: PantryRow[],
  ingredient: CookingUsageInput,
  resolver: Awaited<ReturnType<typeof buildFoodResolver>>
) {
  let remaining = ingredient.actualQuantity;
  if (remaining <= 0) {
    return;
  }

  const matches = pantryRows.filter(
    (row) =>
      row.quantity !== null &&
      foodsMatch(ingredient.actualIngredient, row.ingredient_name, resolver) &&
      unitsAreCompatible(ingredient.actualUnit, row.unit)
  );

  for (const row of matches) {
    if (remaining <= 0) {
      break;
    }

    const currentQuantity = Number(row.quantity) || 0;
    const consumed = Math.min(currentQuantity, remaining);
    const nextQuantity = currentQuantity - consumed;
    remaining -= consumed;

    if (nextQuantity <= 0) {
      const { error } = await supabase
        .from("pantry")
        .delete()
        .eq("id", row.id)
        .eq("user_id", userId);
      if (error) throw new Error(error.message);
      row.quantity = 0;
    } else {
      const { error } = await supabase
        .from("pantry")
        .update({
          quantity: nextQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id)
        .eq("user_id", userId);
      if (error) throw new Error(error.message);
      row.quantity = nextQuantity;
    }
  }
}

export async function consumePantryForCookedMeal(
  supabase: ConsumptionClient,
  input: CompleteCookingInput
): Promise<void> {
  const ingredients = input.ingredients.filter((item) =>
    item.actualIngredient.trim()
  );

  if (ingredients.length === 0) {
    return;
  }

  const { data, error } = await supabase
    .from("pantry")
    .select("id, ingredient_name, quantity, unit")
    .eq("user_id", input.userId)
    .order("expiry_date", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(error.message);
  }

  const pantryRows = (data ?? []).map((row) => ({
    id: row.id,
    ingredient_name: row.ingredient_name,
    quantity: Number(row.quantity) || 0,
    unit: row.unit,
  })) as PantryRow[];

  const resolver = await buildFoodResolver(supabase, [
    ...ingredients.map((item) => item.actualIngredient),
    ...ingredients
      .map((item) => item.expectedIngredient)
      .filter((name): name is string => Boolean(name)),
    ...pantryRows.map((item) => item.ingredient_name),
  ]);

  for (const ingredient of ingredients) {
    await deductIngredientFromPantry(
      supabase,
      input.userId,
      pantryRows,
      ingredient,
      resolver
    );
  }

  const observations = ingredients.map((item) => ({
    recipe_id: input.recipeId ?? null,
    recipe_name: input.recipeName,
    expected_ingredient: item.expectedIngredient,
    actual_ingredient: item.actualIngredient,
    expected_quantity: item.expectedQuantity,
    expected_unit: item.expectedUnit,
    actual_quantity: item.actualQuantity,
    actual_unit: item.actualUnit,
    action: observationAction(item),
  }));

  const { error: observationError } = await supabase
    .from("cooking_behavior_observations")
    .insert(observations);

  if (observationError) {
    throw new Error(observationError.message);
  }
}
