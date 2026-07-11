"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getGeminiModelName } from "@/lib/gemini/config";
import { mapGeminiError } from "@/lib/gemini/map-gemini-error";
import {
  buildMealSuggestionRequest,
  MEAL_SUGGESTION_PROMPT,
} from "@/lib/gemini/meal-prompt";
import { parseMealSuggestionsResponse } from "@/lib/gemini/parse-meals";
import { withGeminiRetry } from "@/lib/gemini/retry";
import { normalizeIngredientName } from "@/lib/ingredient-utils";
import { getAllRecipes } from "@/lib/recipes";
import { rankRecipes } from "@/lib/recipe-ranking";
import { createClient } from "@/lib/supabase/server";
import { triggerShoppingListRegeneration } from "@/app/actions/shopping";
import type { MealSuggestions } from "@/types/meals";

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
    const ranked = rankRecipes(catalogue, pantryForRanking);
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
          topMatches
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

    const suggestions = parseMealSuggestionsResponse(responseText);

    return { status: "success", suggestions };
  } catch (error) {
    console.error("Meal suggestion failed:", error);

    if (error instanceof Error && error.message.includes("meal")) {
      return {
        status: "error",
        message: "Unable to generate meal suggestions.",
      };
    }

    const { message } = mapGeminiError(error);
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

  const usedNormalized = new Set(used.map(normalizeIngredientName));
  const idsToDelete = (pantryItems ?? [])
    .filter((item) =>
      usedNormalized.has(normalizeIngredientName(item.ingredient_name))
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
