"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { triggerShoppingListRegeneration } from "@/app/actions/shopping";
import { getExpiryStatus } from "@/lib/expiry";
import { getGeminiModelName } from "@/lib/gemini/config";
import { mapGeminiError } from "@/lib/gemini/map-gemini-error";
import {
  buildMealSuggestionRequest,
  MEAL_SUGGESTION_PROMPT,
} from "@/lib/gemini/meal-prompt";
import { parseMealSuggestionsResponse } from "@/lib/gemini/parse-meals";
import { withGeminiRetry } from "@/lib/gemini/retry";
import { buildFoodResolver } from "@/lib/food-resolver";
import { getAllRecipes } from "@/lib/recipes";
import { groupRankedRecipes, rankRecipes } from "@/lib/recipe-ranking";
import { foodsMatch } from "@/lib/semantic-match";
import { createClient } from "@/lib/supabase/server";
import type { Meal, MealSuggestions } from "@/types/meals";
import type { RecipeMatch } from "@/types/recipes";

function catalogueIngredientNames(): string[] {
  return getAllRecipes().flatMap((recipe) => recipe.ingredients);
}

export type SuggestMealsResult =
  | { status: "empty" }
  | { status: "success"; suggestions: MealSuggestions }
  | { status: "error"; message: string };

export type CookMealResult =
  | { success: true }
  | { success: false; error: string };

export type SaveMealResult =
  | { success: true }
  | { success: false; error: string };

function recipeMatchToMeal(match: RecipeMatch): Meal {
  const total =
    match.ingredientsUsed.length + match.missingIngredients.length;
  const pantryPercent =
    total > 0
      ? Math.round((match.ingredientsUsed.length / total) * 100)
      : 100;

  return {
    recipeId: match.recipe.id,
    name: match.recipe.name,
    description: match.recipe.description,
    ingredientsUsed: match.ingredientsUsed,
    missingIngredients: match.missingIngredients,
    matchScore: pantryPercent,
    difficulty: match.recipe.difficulty,
    prep_time: match.recipe.prep_time,
    category: match.recipe.category,
  };
}

function limitGroups(
  groups: ReturnType<typeof groupRankedRecipes>,
  limit = 8
): MealSuggestions {
  return {
    canCookNow: groups.canCookNow.slice(0, limit).map(recipeMatchToMeal),
    nearlyThere: groups.nearlyThere.slice(0, limit).map(recipeMatchToMeal),
    shoppingTrip: groups.shoppingTrip.slice(0, limit).map(recipeMatchToMeal),
  };
}

function buildExpirySummary(
  ingredients: Array<{ name: string; expiry_date: string | null }>
): string {
  const buckets: Record<string, string[]> = {
    expired: [],
    today: [],
    tomorrow: [],
    soon: [],
  };

  for (const item of ingredients) {
    const status = getExpiryStatus(item.expiry_date);
    if (status in buckets) {
      buckets[status].push(item.name);
    }
  }

  const lines = [
    buckets.expired.length
      ? `Expired: ${buckets.expired.join(", ")}`
      : null,
    buckets.today.length ? `Expires today: ${buckets.today.join(", ")}` : null,
    buckets.tomorrow.length
      ? `Expires tomorrow: ${buckets.tomorrow.join(", ")}`
      : null,
    buckets.soon.length ? `Expiring soon: ${buckets.soon.join(", ")}` : null,
  ].filter(Boolean);

  return lines.length > 0
    ? lines.join("\n")
    : "No urgent expiry items; still prefer pantry ingredients.";
}

function filterOutCatalogueDuplicates(
  suggestions: MealSuggestions,
  catalogueNames: Set<string>
): MealSuggestions {
  const isDuplicate = (name: string) =>
    catalogueNames.has(name.trim().toLowerCase());

  return {
    canCookNow: suggestions.canCookNow.filter((m) => !isDuplicate(m.name)),
    nearlyThere: suggestions.nearlyThere.filter((m) => !isDuplicate(m.name)),
    shoppingTrip: suggestions.shoppingTrip.filter((m) => !isDuplicate(m.name)),
  };
}

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

async function getPantryForMeals() {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("pantry")
    .select("ingredient_name, expiry_date")
    .eq("user_id", user.id)
    .order("expiry_date", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((item) => ({
    name: item.ingredient_name,
    expiry_date: item.expiry_date as string | null,
  }));
}

/**
 * Deterministic catalogue suggestions — no Gemini call.
 */
export async function getCatalogueMealSuggestions(): Promise<SuggestMealsResult> {
  try {
    const ingredients = await getPantryForMeals();

    if (ingredients.length === 0) {
      return { status: "empty" };
    }

    const pantryForRanking = ingredients.map((i) => ({
      ingredient_name: i.name,
      expiry_date: i.expiry_date,
    }));

    const supabase = await createClient();
    const resolver = await buildFoodResolver(supabase, [
      ...catalogueIngredientNames(),
      ...ingredients.map((i) => i.name),
    ]);

    const ranked = rankRecipes(getAllRecipes(), pantryForRanking, resolver);
    const grouped = groupRankedRecipes(ranked);
    const suggestions = limitGroups(grouped);

    const hasAny =
      suggestions.canCookNow.length > 0 ||
      suggestions.nearlyThere.length > 0 ||
      suggestions.shoppingTrip.length > 0;

    if (!hasAny) {
      return { status: "empty" };
    }

    return { status: "success", suggestions };
  } catch (error) {
    console.error("Catalogue meal suggestions failed:", error);
    return {
      status: "error",
      message: "Unable to load recipe suggestions.",
    };
  }
}

/**
 * Optional AI suggestions — only NEW recipes outside the built-in catalogue.
 */
export async function suggestMeals(): Promise<SuggestMealsResult> {
  try {
    const ingredients = await getPantryForMeals();

    if (ingredients.length === 0) {
      return { status: "empty" };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        status: "error",
        message: "Meal suggestions are not configured.",
      };
    }

    const pantryForRanking = ingredients.map((i) => ({
      ingredient_name: i.name,
      expiry_date: i.expiry_date,
    }));

    const catalogue = getAllRecipes();
    const supabase = await createClient();
    const resolver = await buildFoodResolver(supabase, [
      ...catalogueIngredientNames(),
      ...ingredients.map((i) => i.name),
    ]);
    const ranked = rankRecipes(catalogue, pantryForRanking, resolver);
    const topMatches = ranked.slice(0, 30).map((m) => ({
      name: m.recipe.name,
      matchScore: m.matchScore,
      missingCount: m.missingIngredients.length,
      ingredientsUsed: m.ingredientsUsed,
      missingIngredients: m.missingIngredients,
    }));

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: getGeminiModelName(),
      systemInstruction: MEAL_SUGGESTION_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await withGeminiRetry(() =>
      model.generateContent(
        buildMealSuggestionRequest(
          ingredients,
          catalogue.map((r) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            ingredients: r.ingredients,
            category: r.category,
            difficulty: r.difficulty,
            prep_time: r.prep_time,
          })),
          topMatches,
          buildExpirySummary(ingredients)
        )
      )
    );

    const responseText = result.response.text();

    if (!responseText) {
      return {
        status: "error",
        message: "Unable to generate meal suggestions.",
      };
    }

    const parsed = parseMealSuggestionsResponse(responseText);
    const catalogueNames = new Set(
      catalogue.map((recipe) => recipe.name.trim().toLowerCase())
    );
    const suggestions = filterOutCatalogueDuplicates(parsed, catalogueNames);

    return { status: "success", suggestions };
  } catch (error) {
    console.error("Meal suggestion failed:", error);

    if (error instanceof Error && error.message.includes("meal")) {
      return {
        status: "error",
        message: "Unable to generate meal suggestions.",
      };
    }

    const { message } = mapGeminiError(error, "meals");
    return { status: "error", message };
  }
}

export async function cookMeal(
  ingredientsUsed: string[]
): Promise<CookMealResult> {
  const used = ingredientsUsed
    .map((name) => name.trim())
    .filter(Boolean);

  if (used.length === 0) {
    return { success: false, error: "No ingredients to remove." };
  }

  const { supabase, user } = await getAuthenticatedUser();

  const { data: pantryItems, error: fetchError } = await supabase
    .from("pantry")
    .select("id, ingredient_name")
    .eq("user_id", user.id);

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  const pantryNames = (pantryItems ?? []).map((item) => item.ingredient_name);
  const resolver = await buildFoodResolver(supabase, [...used, ...pantryNames]);

  const idsToDelete = (pantryItems ?? [])
    .filter((item) =>
      used.some((usedName) =>
        foodsMatch(usedName, item.ingredient_name, resolver)
      )
    )
    .map((item) => item.id);

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("pantry")
      .delete()
      .in("id", idsToDelete)
      .eq("user_id", user.id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }
  }

  await triggerShoppingListRegeneration();

  revalidatePath("/pantry");
  revalidatePath("/dashboard");
  revalidatePath("/meals");
  revalidatePath("/planner");
  revalidatePath("/shopping");

  return { success: true };
}

export async function saveMeal(meal: {
  name: string;
  description: string;
  ingredientsUsed: string[];
  missingIngredients: string[];
}): Promise<SaveMealResult> {
  const { supabase, user } = await getAuthenticatedUser();

  const { error } = await supabase.from("meals_saved").insert({
    user_id: user.id,
    meal_name: meal.name.trim(),
    description: meal.description.trim(),
    ingredients_used: meal.ingredientsUsed,
    missing_ingredients: meal.missingIngredients,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/meals");
  revalidatePath("/saved-meals");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function removeSavedMeal(id: string): Promise<SaveMealResult> {
  const { supabase, user } = await getAuthenticatedUser();

  const { error } = await supabase
    .from("meals_saved")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/meals");
  revalidatePath("/saved-meals");
  revalidatePath("/dashboard");

  return { success: true };
}
