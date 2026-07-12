export const MEAL_SUGGESTION_PROMPT = `You are a meal planning assistant focused on reducing food waste.

The user has ALREADY been shown the best matching recipes from ShelfLife's built-in catalogue.

YOUR TASK:
- Generate ONLY genuinely NEW recipe ideas that are NOT already in the built-in catalogue.
- NEVER return a recipe whose name matches (or is a trivial rename of) a catalogue recipe.
- Prefer recipes that still use the user's pantry ingredients.
- Prioritise ingredients closest to expiry to minimise food waste.
- Invent creative home-cooking recipes suitable for the pantry on hand.

Return JSON only in three groups:

canCookNow — Up to 5 NEW meals requiring NO additional ingredients
nearlyThere — Up to 5 NEW meals missing a maximum of 3 ingredients
shoppingTrip — Up to 5 NEW meals requiring several additional ingredients

Do not pad groups with catalogue duplicates. If you cannot invent enough unique recipes for a group, return fewer.

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
  }>,
  expirySummary: string
): string {
  const pantryList = ingredients
    .map((ingredient) => {
      const expiry = ingredient.expiry_date
        ? ` (expires ${ingredient.expiry_date})`
        : "";
      return `- ${ingredient.name}${expiry}`;
    })
    .join("\n");

  const catalogueNames = catalogue.map((r) => `- ${r.name}`).join("\n");

  const topList = topMatches
    .slice(0, 20)
    .map(
      (m) =>
        `- ${m.name} (already shown; score:${m.matchScore}, missing:${m.missingCount})`
    )
    .join("\n");

  return `Pantry ingredients (prioritise expiring soonest):
${pantryList}

Expiry / waste priority summary:
${expirySummary}

Built-in catalogue recipes ALREADY SHOWN to the user (DO NOT return these or near-duplicates):
${catalogueNames}

Highest-ranked catalogue matches already displayed (DO NOT repeat):
${topList || "None"}

Generate only NEW recipe ideas absent from the catalogue above. Prefer pantry usage and reduce food waste.`;
}
