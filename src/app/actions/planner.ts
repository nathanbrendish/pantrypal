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
import { withPlannerGeminiRetry } from "@/lib/gemini/retry";
import { createClient } from "@/lib/supabase/server";
import { triggerShoppingListRegeneration } from "@/app/actions/shopping";
import type { MealPlanItem } from "@/types/v2";

export type GeneratePlanResult =
  | { success: true; planId: string }
  | { success: false; error: string };

export type PlannerActionResult =
  | { success: true }
  | { success: false; error: string };

function isMealPlanParseError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("meal plan") ||
      error.message.includes("meals list"))
  );
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
  console.log("[generateMealPlan] started", { daysCount });

  try {
    const { supabase, user } = await getAuthenticatedUser();

    const { data: pantry, error: pantryError } = await supabase
      .from("pantry")
      .select("ingredient_name, expiry_date")
      .eq("user_id", user.id);

    if (pantryError) {
      console.error("[generateMealPlan] pantry fetch failed:", pantryError);
      return {
        success: false,
        error: "Unable to load your pantry. Please try again.",
      };
    }

    console.log("[generateMealPlan] pantry loaded", {
      ingredientCount: pantry?.length ?? 0,
    });

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

    console.log("[generateMealPlan] requesting Gemini meal plan");

    const meals = await withPlannerGeminiRetry(async () => {
      const result = await model.generateContent(
        buildMealPlanRequest(daysCount, pantryItems)
      );
      const responseText = result.response.text();

      console.log("[generateMealPlan] Gemini response received", {
        hasText: Boolean(responseText),
        length: responseText?.length ?? 0,
      });

      if (!responseText) {
        throw new Error("Gemini returned an empty meal plan response.");
      }

      const parsed = parseMealPlanResponse(responseText, daysCount);

      if (parsed.length === 0) {
        throw new Error("No meals were parsed from the meal plan response.");
      }

      return parsed;
    });

    console.log("[generateMealPlan] parsed meals", {
      count: meals.length,
      names: meals.map((meal) => meal.name),
    });

    const { data: existingPlans } = await supabase
      .from("meal_plans")
      .select("id")
      .eq("user_id", user.id);

    if (existingPlans && existingPlans.length > 0) {
      await supabase.from("meal_plans").delete().eq("user_id", user.id);
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
      console.error("[generateMealPlan] plan insert failed:", planError);
      return {
        success: false,
        error: planError?.message ?? "Failed to save your meal plan.",
      };
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
      console.error("[generateMealPlan] items insert failed:", itemsError);
      return { success: false, error: itemsError.message };
    }

    console.log("[generateMealPlan] plan saved", { planId: plan.id });

    try {
      await triggerShoppingListRegeneration();
    } catch (shoppingError) {
      console.error(
        "[generateMealPlan] shopping list regen failed (non-fatal):",
        shoppingError
      );
    }

    revalidatePath("/planner");
    revalidatePath("/dashboard");
    revalidatePath("/shopping");

    console.log("[generateMealPlan] completed successfully", {
      planId: plan.id,
    });

    return { success: true, planId: plan.id };
  } catch (error) {
    console.error("[generateMealPlan] failed:", error);

    if (isMealPlanParseError(error)) {
      return {
        success: false,
        error:
          "Unable to read the meal plan from AI. Please try again.",
      };
    }

    const { message } = mapGeminiError(error, "planner");
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

  try {
    await triggerShoppingListRegeneration();
  } catch (shoppingError) {
    console.error(
      "[reorderMealPlanItems] shopping list regen failed (non-fatal):",
      shoppingError
    );
  }

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
        const expiry = entry.expiry_date
          ? ` (expires ${entry.expiry_date})`
          : "";
        return `- ${entry.ingredient_name}${expiry}`;
      })
      .join("\n");

    const prompt = `Create ONE replacement meal for day ${item.day_index + 1}.

Do NOT duplicate these existing meals: ${existingMeals || "none"}.

Pantry:
${pantryList || "None"}

Return JSON with a single meal in the meals array with dayIndex ${item.day_index}.`;

    const replacement = await withPlannerGeminiRetry(async () => {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      if (!responseText) {
        throw new Error("Gemini returned an empty replacement meal response.");
      }

      const meals = parseMealPlanResponse(
        responseText,
        plan?.days_count ?? 7
      );
      const meal =
        meals.find((entry) => entry.dayIndex === item.day_index) ?? meals[0];

      if (!meal) {
        throw new Error("No replacement meal was parsed from AI response.");
      }

      return meal;
    });

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

    try {
      await triggerShoppingListRegeneration();
    } catch (shoppingError) {
      console.error(
        "[replaceMealPlanItem] shopping list regen failed (non-fatal):",
        shoppingError
      );
    }

    revalidatePath("/planner");
    revalidatePath("/shopping");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("[replaceMealPlanItem] failed:", error);

    if (isMealPlanParseError(error)) {
      return {
        success: false,
        error:
          "Unable to read the replacement meal from AI. Please try again.",
      };
    }

    const { message } = mapGeminiError(error, "planner");
    return { success: false, error: message };
  }
}
