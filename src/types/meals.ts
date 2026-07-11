export type Meal = {
  name: string;
  description: string;
  ingredientsUsed: string[];
  missingIngredients: string[];
};

export type MealSuggestions = {
  canCookNow: Meal[];
  nearlyThere: Meal[];
  shoppingTrip: Meal[];
};

export type MealGroupKey = keyof MealSuggestions;
