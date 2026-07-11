import type { Meal, MealGroupKey, MealSuggestions } from "@/types/meals";

const MEAL_GROUP_KEYS: MealGroupKey[] = [
  "canCookNow",
  "nearlyThere",
  "shoppingTrip",
];

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseMeal(value: unknown): Meal | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const meal = value as Record<string, unknown>;

  if (typeof meal.name !== "string" || !meal.name.trim()) {
    return null;
  }

  if (typeof meal.description !== "string") {
    return null;
  }

  return {
    name: meal.name.trim(),
    description: meal.description.trim(),
    ingredientsUsed: parseStringArray(meal.ingredientsUsed),
    missingIngredients: parseStringArray(meal.missingIngredients),
  };
}

function parseMealGroup(value: unknown): Meal[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(parseMeal)
    .filter((meal): meal is Meal => meal !== null);
}

export function parseMealSuggestionsResponse(text: string): MealSuggestions {
  const trimmed = text.trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(trimmed);
  } catch {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Could not parse meal suggestions from AI.");
    }

    parsed = JSON.parse(jsonMatch[0]);
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("AI response did not include valid meal suggestions.");
  }

  const record = parsed as Record<string, unknown>;
  const suggestions: MealSuggestions = {
    canCookNow: [],
    nearlyThere: [],
    shoppingTrip: [],
  };

  for (const key of MEAL_GROUP_KEYS) {
    suggestions[key] = parseMealGroup(record[key]);
  }

  const hasMeals = MEAL_GROUP_KEYS.some((key) => suggestions[key].length > 0);

  if (!hasMeals) {
    throw new Error("No meals were returned from AI.");
  }

  return suggestions;
}

export function hasMealSuggestions(suggestions: MealSuggestions): boolean {
  return MEAL_GROUP_KEYS.some((key) => suggestions[key].length > 0);
}
