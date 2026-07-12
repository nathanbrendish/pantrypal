"use server";

import { getExpiryStatus } from "@/lib/expiry";
import { buildFoodResolver } from "@/lib/food-resolver";
import { countCookableRecipes } from "@/lib/recipe-match";
import { rankRecipes } from "@/lib/recipe-ranking";
import { getAllRecipes } from "@/lib/recipes";
import { formatExpiryLabel } from "@/lib/expiry";
import { createClient } from "@/lib/supabase/server";

export type DashboardStats = {
  pantryIngredients: number;
  mealsAvailable: number;
  mealsSaved: number;
  expiringSoon: number;
  plannedMeals: number;
  shoppingListItems: number;
};

export type DashboardHomeData = {
  stats: DashboardStats;
  recommendation: {
    id: string;
    name: string;
    description: string;
    href: string;
    matchScore: number;
  } | null;
  expiringItems: Array<{
    id: string;
    name: string;
    expiryLabel: string;
    status: ReturnType<typeof getExpiryStatus>;
  }>;
  weekPlan: Array<{
    id: string;
    dayLabel: string;
    mealName: string;
  }>;
  shoppingSummary: {
    total: number;
    checked: number;
    unchecked: number;
  };
};

export async function getDashboardStats(
  userId: string
): Promise<DashboardStats> {
  const home = await getDashboardHomeData(userId);
  return home.stats;
}

export async function getDashboardHomeData(
  userId: string
): Promise<DashboardHomeData> {
  const supabase = await createClient();

  const [
    { count: pantryCount },
    { data: pantryItems },
    { count: savedCount },
    { data: planItems },
    { data: shoppingItems },
  ] = await Promise.all([
    supabase
      .from("pantry")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("pantry")
      .select("id, ingredient_name, expiry_date")
      .eq("user_id", userId),
    supabase
      .from("meals_saved")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("meal_plan_items")
      .select("id, meal_name, day_index, sort_order")
      .eq("user_id", userId)
      .order("day_index")
      .order("sort_order"),
    supabase
      .from("shopping_list_items")
      .select("id, checked")
      .eq("user_id", userId),
  ]);

  const pantryForMatch = (pantryItems ?? []).map((item) => ({
    ingredient_name: item.ingredient_name,
    expiry_date: item.expiry_date as string | null,
  }));

  const expiringSoon = (pantryItems ?? []).filter((item) => {
    const status = getExpiryStatus(item.expiry_date as string | null);
    return ["expired", "today", "tomorrow", "soon"].includes(status);
  }).length;

  const expiringItems = (pantryItems ?? [])
    .map((item) => {
      const status = getExpiryStatus(item.expiry_date as string | null);
      return {
        id: item.id as string,
        name: item.ingredient_name as string,
        expiryLabel: formatExpiryLabel(item.expiry_date as string | null),
        status,
      };
    })
    .filter((item) =>
      ["expired", "today", "tomorrow", "soon"].includes(item.status)
    )
    .slice(0, 5);

  const resolver = await buildFoodResolver(supabase, [
    ...getAllRecipes().flatMap((recipe) => recipe.ingredients),
    ...pantryForMatch.map((item) => item.ingredient_name),
  ]);

  const mealsAvailable = countCookableRecipes(
    getAllRecipes(),
    pantryForMatch,
    resolver
  );

  const ranked = rankRecipes(getAllRecipes(), pantryForMatch, resolver);
  const topRecipe = ranked[0];

  const recommendation = topRecipe
    ? {
        id: topRecipe.recipe.id,
        name: topRecipe.recipe.name,
        description: topRecipe.recipe.description,
        href: `/recipes?id=${encodeURIComponent(topRecipe.recipe.id)}`,
        matchScore: topRecipe.matchScore,
      }
    : null;

  const weekPlan = (planItems ?? []).slice(0, 7).map((item) => ({
    id: item.id as string,
    dayLabel: `Day ${(item.day_index as number) + 1}`,
    mealName: item.meal_name as string,
  }));

  const shopping = shoppingItems ?? [];
  const checked = shopping.filter((item) => item.checked).length;

  return {
    stats: {
      pantryIngredients: pantryCount ?? 0,
      mealsAvailable,
      mealsSaved: savedCount ?? 0,
      expiringSoon,
      plannedMeals: planItems?.length ?? 0,
      shoppingListItems: shopping.filter((item) => !item.checked).length,
    },
    recommendation,
    expiringItems,
    weekPlan,
    shoppingSummary: {
      total: shopping.length,
      checked,
      unchecked: shopping.length - checked,
    },
  };
}
