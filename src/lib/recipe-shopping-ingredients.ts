import type { Recipe } from "@/types/recipes";

export function quantityAwareMissingIngredients(
  recipe: Recipe,
  missingIngredients: string[]
): string[] {
  const quantityByIngredient = new Map(
    recipe.ingredients.map((ingredient, index) => [
      ingredient,
      recipe.typical_quantities[index] ?? "",
    ])
  );

  return missingIngredients.map((ingredient) => {
    const quantity = quantityByIngredient.get(ingredient)?.trim();
    return quantity ? `${quantity} ${ingredient}` : ingredient;
  });
}
