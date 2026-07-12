export type ScannedIngredient = {
  ingredient_name: string;
  quantity: number;
  unit: string | null;
};

export type ReviewIngredient = {
  id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  storage_location_id: string;
  expiry_date: string;
  checked: boolean;
};

export type SavedMeal = {
  id: string;
  meal_name: string;
  description: string;
  ingredients_used: string[];
  missing_ingredients: string[];
  created_at: string;
};

export type MealPlanItem = {
  id: string;
  day_index: number;
  sort_order: number;
  meal_name: string;
  description: string;
  ingredients_used: string[];
  missing_ingredients: string[];
};

export type ShoppingListItem = {
  id: string;
  ingredient_name: string;
  quantity: number | null;
  unit: string | null;
  category: string;
  checked: boolean;
  needed_for_meals: number;
  shortage_label: string | null;
  demand_quantity: number | null;
  demand_unit: string | null;
  pantry_quantity: number | null;
  pantry_unit: string | null;
  used_by_meals: string[];
};

export const SHOPPING_CATEGORIES = [
  "Produce",
  "Meat",
  "Dairy",
  "Bakery",
  "Frozen",
  "Cupboard",
  "Herbs & Spices",
  "Drinks",
  "Unclassified",
] as const;

export type ShoppingCategory = (typeof SHOPPING_CATEGORIES)[number];
