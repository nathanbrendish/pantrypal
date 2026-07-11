import { BUILTIN_RECIPES } from "@/data/recipes";
import type { Recipe } from "@/types/recipes";

export function getAllRecipes(): Recipe[] {
  return BUILTIN_RECIPES;
}

export function getRecipeById(id: string): Recipe | undefined {
  return BUILTIN_RECIPES.find((recipe) => recipe.id === id);
}

export function getRecipeCategories(): string[] {
  return [...new Set(BUILTIN_RECIPES.map((r) => r.category))].sort();
}
