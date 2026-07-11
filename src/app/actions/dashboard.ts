"use server";

import { getExpiryStatus } from "@/lib/expiry";
import { countCookableRecipes } from "@/lib/recipe-match";
import { getAllRecipes } from "@/lib/recipes";
import { createClient } from "@/lib/supabase/server";

export type DashboardStats = {
  pantryIngredients: number;
  mealsAvailable: number;
  mealsSaved: number;
  expiringSoon: number;
  plannedMeals: number;
  shoppingListItems: number;
};

export async function getDashboardStats(
  userId: string
): Promise<DashboardStats> {
  const supabase = await createClient();

  const [
    { count: pantryCount },
    { data: pantryItems },
    { count: savedCount },
    { data: planItems },
    { count: shoppingCount },
  ] = await Promise.all([
    supabase
      .from("pantry")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("pantry")
      .select("ingredient_name, expiry_date")
      .eq("user_id", userId),
    supabase
      .from("meals_saved")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("meal_plan_items")
      .select("id")
      .eq("user_id", userId),
    supabase
      .from("shopping_list_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("checked", false),
  ]);

  const expiringSoon = (pantryItems ?? []).filter((item) => {
    const status = getExpiryStatus(item.expiry_date as string | null);
    return (
      status === "expired" ||
      status === "today" ||
      status === "tomorrow" ||
      status === "soon"
    );
  }).length;

  const pantryForMatch = (pantryItems ?? []).map((item) => ({
    ingredient_name: item.ingredient_name,
    expiry_date: item.expiry_date as string | null,
  }));

  const mealsAvailable = countCookableRecipes(getAllRecipes(), pantryForMatch);

  return {
    pantryIngredients: pantryCount ?? 0,
    mealsAvailable,
    mealsSaved: savedCount ?? 0,
    expiringSoon,
    plannedMeals: planItems?.length ?? 0,
    shoppingListItems: shoppingCount ?? 0,
  };
}
