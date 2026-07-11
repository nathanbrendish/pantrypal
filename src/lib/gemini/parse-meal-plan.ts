import type { Meal } from "@/types/meals";

type MealPlanResponse = {
  meals: Array<{
    dayIndex: number;
    name: string;
    description: string;
    ingredientsUsed: string[];
    missingIngredients: string[];
  }>;
};

function parseMeal(value: unknown): Meal | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (typeof record.name !== "string" || !record.name.trim()) {
    return null;
  }

  const ingredientsUsed = Array.isArray(record.ingredientsUsed)
    ? record.ingredientsUsed.filter(
        (item): item is string => typeof item === "string" && item.trim() !== ""
      )
    : [];

  const missingIngredients = Array.isArray(record.missingIngredients)
    ? record.missingIngredients.filter(
        (item): item is string => typeof item === "string" && item.trim() !== ""
      )
    : [];

  return {
    name: record.name.trim(),
    description:
      typeof record.description === "string" ? record.description.trim() : "",
    ingredientsUsed,
    missingIngredients,
  };
}

export function parseMealPlanResponse(
  text: string,
  daysCount: number
): Array<Meal & { dayIndex: number }> {
  const trimmed = text.trim();
  let parsed: unknown;

  try {
    parsed = JSON.parse(trimmed);
  } catch {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse meal plan response from AI.");
    }
    parsed = JSON.parse(jsonMatch[0]);
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("meals" in parsed) ||
    !Array.isArray((parsed as MealPlanResponse).meals)
  ) {
    throw new Error("AI response did not include a valid meals list.");
  }

  const meals = (parsed as MealPlanResponse).meals
    .map((item) => {
      const meal = parseMeal(item);
      if (!meal || typeof item.dayIndex !== "number") {
        return null;
      }
      return { ...meal, dayIndex: item.dayIndex };
    })
    .filter((item): item is Meal & { dayIndex: number } => item !== null);

  const uniqueByDay = new Map<number, Meal & { dayIndex: number }>();

  for (const meal of meals) {
    if (meal.dayIndex >= 0 && meal.dayIndex < daysCount) {
      uniqueByDay.set(meal.dayIndex, meal);
    }
  }

  return [...uniqueByDay.values()].sort((a, b) => a.dayIndex - b.dayIndex);
}
