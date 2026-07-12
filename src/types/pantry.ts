export type PantryItem = {
  id: string;
  ingredient_name: string;
  quantity: number;
  unit: string | null;
  category: string | null;
  subcategory: string | null;
  expiry_date: string | null;
  created_at?: string;
  updated_at?: string;
};

export type PantryIngredientInput = {
  ingredient_name: string;
  quantity: number;
  unit: string | null;
  category?: string | null;
  subcategory?: string | null;
  expiry_date: string | null;
};

export type ExpiryStatus =
  | "expired"
  | "today"
  | "tomorrow"
  | "soon"
  | "ok"
  | "none";
