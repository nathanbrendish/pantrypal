export type RecipeDifficulty = "Easy" | "Medium" | "Hard";

export type Recipe = {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  typical_quantities: string[];
  instructions: string[];
  difficulty: RecipeDifficulty;
  prep_time: number;
  category: string;
  image: string | null;
};

export type RecipeMatch = {
  recipe: Recipe;
  ingredientsUsed: string[];
  missingIngredients: string[];
  matchScore: number;
};

export type RecipeFilters = {
  search?: string;
  category?: string;
  difficulty?: RecipeDifficulty;
  maxPrepTime?: number;
};
