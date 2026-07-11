"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getGeminiModelName } from "@/lib/gemini/config";
import { mapGeminiError } from "@/lib/gemini/map-gemini-error";
import { parseMealPlanResponse } from "@/lib/gemini/parse-meal-plan";
import {
  buildMealPlanRequest,
  MEAL_PLAN_PROMPT,
} from "@/lib/gemini/planner-prompt";
import { withGeminiRetry } from "@/lib/gemini/retry";
import { createClient } from "@/lib/supabase/server";
import { triggerShoppingListRegeneration } from "@/app/actions/shopping";
import type { MealPlanItem } from "@/types/v2";

export type GeneratePlanResult =
  | { success: true; planId: string }
  | { success: false; error: string };

export type PlannerActionResult =
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

export async function getCurrentMealPlan(): Promise<{
  planId: string | null;
  daysCount: number;
  items: MealPlanItem[];
}> {
  const { supabase, user } = await getAuthenticatedUser();

  const { data: plans } = await supabase
    .from("meal_plans")
    .select("id, days_count")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const plan = plans?.[0];

  if (!plan) {
    return { planId: null, daysCount: 0, items: [] };
  }

  const { data: items } = await supabase
    .from("meal_plan_items")
    .select(
      "id, day_index, sort_order, meal_name, description, ingredients_used, missing_ingredients"
    )
    .eq("plan_id", plan.id)
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  return {
    planId: plan.id,
    daysCount: plan.days_count,
    items: (items ?? []).map((item) => ({
      id: item.id,
      day_index: item.day_index,
      sort_order: item.sort_order,
      meal_name: item.meal_name,
      description: item.description,
      ingredients_used: item.ingredients_used as string[],
      missing_ingredients: item.missing_ingredients as string[],
    })),
  };
}

export async function generateMealPlan(
  daysCount: 3 | 5 | 7
): Promise<GeneratePlanResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const { data: pantry, error: pantryError } = await supabase
      .from("pantry")
      .select("ingredient_name, expiry_date")
      .eq("user_id", user.id);

    if (pantryError) {
      return { success: false, error: pantryError.message };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        error: "Meal planner is not configured.",
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: getGeminiModelName(),
      systemInstruction: MEAL_PLAN_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const pantryItems = (pantry ?? []).map((item) => ({
      name: item.ingredient_name,
      expiry_date: item.expiry_date as string | null,
    }));

    const result = await withGeminiRetry(() =>
      model.generateContent(buildMealPlanRequest(daysCount, pantryItems))
    );

    const responseText = result.response.text();

    if (!responseText) {
      return { success: false, error: "Unable to generate meal plan." };
    }

    const meals = parseMealPlanResponse(responseText, daysCount);

    if (meals.length === 0) {
      return { success: false, error: "No meals were generated." };
    }

    const { data: existingPlans } = await supabase
      .from("meal_plans")
      .select("id")
      .eq("user_id", user.id);

    if (existingPlans && existingPlans.length > 0) {
      await supabase
        .from("meal_plans")
        .delete()
        .eq("user_id", user.id);
    }

    const { data: plan, error: planError } = await supabase
      .from("meal_plans")
      .insert({
        user_id: user.id,
        days_count: daysCount,
      })
      .select("id")
      .single();

    if (planError || !plan) {
      return { success: false, error: planError?.message ?? "Failed to save plan." };
    }

    const items = meals.map((meal, index) => ({
      plan_id: plan.id,
      user_id: user.id,
      day_index: meal.dayIndex,
      sort_order: index,
      meal_name: meal.name,
      description: meal.description,
      ingredients_used: meal.ingredientsUsed,
      missing_ingredients: meal.missingIngredients,
    }));

    const { error: itemsError } = await supabase
      .from("meal_plan_items")
      .insert(items);

    if (itemsError) {
      return { success: false, error: itemsError.message };
    }

    await triggerShoppingListRegeneration();

    revalidatePath("/planner");
    revalidatePath("/dashboard");
    revalidatePath("/shopping");

    return { success: true, planId: plan.id };
  } catch (error) {
    console.error("Meal plan generation failed:", error);
    const { message } = mapGeminiError(error);
    return { success: false, error: message };
  }
}

export async function reorderMealPlanItems(
  orderedIds: string[]
): Promise<PlannerActionResult> {
  const { supabase, user } = await getAuthenticatedUser();

  for (let index = 0; index < orderedIds.length; index++) {
    const { error } = await supabase
      .from("meal_plan_items")
      .update({ sort_order: index })
      .eq("id", orderedIds[index])
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  await triggerShoppingListRegeneration();

  revalidatePath("/planner");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function replaceMealPlanItem(
  itemId: string
): Promise<PlannerActionResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const { data: item, error: itemError } = await supabase
      .from("meal_plan_items")
      .select("plan_id, day_index")
      .eq("id", itemId)
      .eq("user_id", user.id)
      .single();

    if (itemError || !item) {
      return { success: false, error: "Meal not found." };
    }

    const { data: plan } = await supabase
      .from("meal_plans")
      .select("days_count")
      .eq("id", item.plan_id)
      .single();

    const { data: existingItems } = await supabase
      .from("meal_plan_items")
      .select("meal_name, ingredients_used, missing_ingredients")
      .eq("plan_id", item.plan_id)
      .eq("user_id", user.id);

    const { data: pantry } = await supabase
      .from("pantry")
      .select("ingredient_name, expiry_date")
      .eq("user_id", user.id);

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return { success: false, error: "Meal planner is not configured." };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: getGeminiModelName(),
      systemInstruction: MEAL_PLAN_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const existingMeals = (existingItems ?? [])
      .map((entry) => entry.meal_name)
      .join(", ");

    const pantryList = (pantry ?? [])
      .map((entry) => {
        const expiry = entry.expiry_date ? ` (expires ${entry.expiry_date})` : "";
        return `- ${entry.ingredient_name}${expiry}`;
      })
      .join("\n");

    const prompt = `Create ONE replacement meal for day ${item.day_index + 1}.

Do NOT duplicate these existing meals: ${existingMeals || "none"}.

Pantry:
${pantryList || "None"}

Return JSON with a single meal in the meals array with dayIndex ${item.day_index}.`;

    const result = await withGeminiRetry(() => model.generateContent(prompt));
    const responseText = result.response.text();

    if (!responseText) {
      return { success: false, error: "Unable to generate replacement meal." };
    }

    const meals = parseMealPlanResponse(
      responseText,
      plan?.days_count ?? 7
    );
    const replacement = meals.find((meal) => meal.dayIndex === item.day_index) ?? meals[0];

    if (!replacement) {
      return { success: false, error: "No replacement meal generated." };
    }

    const { error: updateError } = await supabase
      .from("meal_plan_items")
      .update({
        meal_name: replacement.name,
        description: replacement.description,
        ingredients_used: replacement.ingredientsUsed,
        missing_ingredients: replacement.missingIngredients,
      })
      .eq("id", itemId)
      .eq("user_id", user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    await triggerShoppingListRegeneration();

    revalidatePath("/planner");
    revalidatePath("/shopping");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Replace meal failed:", error);
    const { message } = mapGeminiError(error);
    return { success: false, error: message };
  }
}
