export const MEAL_SUGGESTION_PROMPT = `You are a meal planning assistant focused on reducing food waste.

You are given:
1. The user's current pantry (with expiry dates)
2. A built-in recipe catalogue

YOUR TASK:
- FIRST select and rank suitable meals FROM THE BUILT-IN CATALOGUE
- Prioritise recipes using ingredients already in the pantry
- Prioritise ingredients closest to expiry
- Minimise food waste and missing ingredients
- ONLY invent new recipes if fewer than 5 suitable catalogue recipes exist for a group

Return JSON only in three groups:

canCookNow — Exactly 5 meals requiring NO additional ingredients
nearlyThere — Exactly 5 meals missing a maximum of 3 ingredients
shoppingTrip — Exactly 5 meals requiring several additional ingredients

For catalogue recipes, use the exact recipe name from the catalogue.
For invented recipes, clearly mark with a new creative name.

For every meal return:
name, description, ingredientsUsed, missingIngredients

Return valid JSON only. No markdown. No explanations.`;

export type PantryIngredientForMeals = {
  name: string;
  expiry_date: string | null;
};

export type CatalogueRecipeForPrompt = {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  category: string;
  difficulty: string;
  prep_time: number;
};

export function buildMealSuggestionRequest(
  ingredients: PantryIngredientForMeals[],
  catalogue: CatalogueRecipeForPrompt[],
  topMatches: Array<{
    name: string;
    matchScore: number;
    missingCount: number;
    ingredientsUsed: string[];
    missingIngredients: string[];
  }>
): string {
  const pantryList = ingredients
    .map((ingredient) => {
      const expiry = ingredient.expiry_date
        ? ` (expires ${ingredient.expiry_date})`
        : "";
      return `- ${ingredient.name}${expiry}`;
    })
    .join("\n");

  const topList = topMatches
    .slice(0, 30)
    .map(
      (m) =>
        `- ${m.name} (score:${m.matchScore}, missing:${m.missingCount}, uses:[${m.ingredientsUsed.join(", ")}])`
    )
    .join("\n");

  const catalogSummary = catalogue
    .slice(0, 50)
    .map((r) => `- ${r.name}: ${r.ingredients.join(", ")}`)
    .join("\n");

  return `Pantry ingredients (prioritise expiring soonest):
${pantryList}

Top pre-ranked catalogue matches:
${topList || "None"}

Built-in catalogue (select from these first):
${catalogSummary}

Rank the most suitable catalogue recipes into the three groups. Only invent new recipes to fill gaps when the catalogue has fewer than 5 suitable options per group.`;
}
