export type Meal = {
  name: string;
  description: string;
  ingredientsUsed: string[];
  missingIngredients: string[];
  /** Present for built-in catalogue recipes; absent for AI-invented meals. */
  recipeId?: string;
  matchScore?: number;
  difficulty?: string;
  prep_time?: number;
  category?: string;
};

export type MealSuggestions = {
  canCookNow: Meal[];
  nearlyThere: Meal[];
  shoppingTrip: Meal[];
};

export type MealGroupKey = keyof MealSuggestions;
