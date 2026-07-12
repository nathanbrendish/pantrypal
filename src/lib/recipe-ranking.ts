import { getExpiryStatus } from "@/lib/expiry";
import { matchRecipeToPantry, type PantryForMatching } from "@/lib/recipe-match";
import { foodsMatch, type FoodResolver } from "@/lib/semantic-match";
import type { Recipe, RecipeMatch } from "@/types/recipes";

function expiryBonus(
  recipe: Recipe,
  pantry: PantryForMatching[],
  resolver?: FoodResolver | null
): number {
  let bonus = 0;

  for (const ingredient of recipe.ingredients) {
    const pantryItem = pantry.find((item) =>
      foodsMatch(ingredient, item.ingredient_name, resolver)
    );

    if (!pantryItem?.expiry_date) continue;

    const status = getExpiryStatus(pantryItem.expiry_date);
    if (status === "expired") bonus += 30;
    else if (status === "today") bonus += 25;
    else if (status === "tomorrow") bonus += 20;
    else if (status === "soon") bonus += 15;
  }

  return bonus;
}

export function rankRecipes(
  recipes: Recipe[],
  pantry: PantryForMatching[],
  resolver?: FoodResolver | null
): RecipeMatch[] {
  return recipes
    .map((recipe) => {
      const match = matchRecipeToPantry(recipe, pantry, resolver);
      const missingPenalty = match.missingIngredients.length * 10;
      const score =
        match.matchScore + expiryBonus(recipe, pantry, resolver) - missingPenalty;

      return { ...match, matchScore: Math.max(0, score) };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function groupRankedRecipes(matches: RecipeMatch[]): {
  canCookNow: RecipeMatch[];
  nearlyThere: RecipeMatch[];
  shoppingTrip: RecipeMatch[];
} {
  const canCookNow = matches.filter((m) => m.missingIngredients.length === 0);
  const nearlyThere = matches.filter(
    (m) => m.missingIngredients.length > 0 && m.missingIngredients.length <= 3
  );
  const shoppingTrip = matches.filter((m) => m.missingIngredients.length > 3);

  return { canCookNow, nearlyThere, shoppingTrip };
}
