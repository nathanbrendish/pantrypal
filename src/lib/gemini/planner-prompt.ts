export const MEAL_PLAN_PROMPT = `You are a weekly meal planning assistant focused on reducing food waste.

Create a meal plan using the user's pantry and priorities below.

Priorities:
1. Use pantry ingredients, especially those expiring soon
2. Reuse ingredients across the week to reduce waste
3. Avoid duplicate meals in the plan
4. Each day should have exactly one distinct meal

Return JSON only with this shape:

{
  "meals": [
    {
      "dayIndex": 0,
      "name": "Meal name",
      "description": "Short description",
      "ingredientsUsed": ["Ingredient A"],
      "missingIngredients": ["Ingredient B"]
    }
  ]
}

dayIndex starts at 0 for the first day.

No markdown. No explanations.`;

export type PantryIngredientForPlan = {
  name: string;
  expiry_date: string | null;
};

export function buildMealPlanRequest(
  daysCount: number,
  pantry: PantryIngredientForPlan[]
): string {
  const pantryList = pantry
    .map((item) => {
      const expiry = item.expiry_date ? ` (expires ${item.expiry_date})` : "";
      return `- ${item.name}${expiry}`;
    })
    .join("\n");

  return `Create a ${daysCount}-day meal plan.

Pantry ingredients:
${pantryList || "None"}

Return exactly ${daysCount} meals with dayIndex 0 through ${daysCount - 1}.`;
}
