import { foodsMatch, type FoodResolver } from "@/lib/semantic-match";
import type { Recipe, RecipeMatch } from "@/types/recipes";

export type PantryForMatching = {
  ingredient_name: string;
  expiry_date?: string | null;
};

export function matchRecipeToPantry(
  recipe: Recipe,
  pantry: PantryForMatching[],
  resolver?: FoodResolver | null
): RecipeMatch {
  const ingredientsUsed: string[] = [];
  const missingIngredients: string[] = [];

  for (const ingredient of recipe.ingredients) {
    const match = pantry.find((item) =>
      foodsMatch(ingredient, item.ingredient_name, resolver)
    );

    if (match) {
      ingredientsUsed.push(match.ingredient_name);
    } else {
      missingIngredients.push(ingredient);
    }
  }

  const total = recipe.ingredients.length;
  const matchScore =
    total > 0 ? Math.round((ingredientsUsed.length / total) * 100) : 0;

  return {
    recipe,
    ingredientsUsed,
    missingIngredients,
    matchScore,
  };
}

export function countCookableRecipes(
  recipes: Recipe[],
  pantry: PantryForMatching[],
  resolver?: FoodResolver | null
): number {
  return recipes.filter(
    (recipe) =>
      matchRecipeToPantry(recipe, pantry, resolver).missingIngredients.length === 0
  ).length;
}

export function filterRecipes(
  recipes: Recipe[],
  filters: {
    search?: string;
    category?: string;
    difficulty?: string;
    maxPrepTime?: number;
  }
): Recipe[] {
  const search = filters.search?.trim().toLowerCase();

  return recipes.filter((recipe) => {
    if (search) {
      const haystack = `${recipe.name} ${recipe.description} ${recipe.ingredients.join(" ")}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    if (filters.category && filters.category !== "All" && recipe.category !== filters.category) {
      return false;
    }

    if (filters.difficulty && filters.difficulty !== "All" && recipe.difficulty !== filters.difficulty) {
      return false;
    }

    if (filters.maxPrepTime && recipe.prep_time > filters.maxPrepTime) {
      return false;
    }

    return true;
  });
}
