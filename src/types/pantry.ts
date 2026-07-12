export type PantryEmbeddedRef = {
  name: string;
  icon: string | null;
} | null;

export type PantryItem = {
  id: string;
  ingredient_name: string;
  quantity: number;
  unit: string | null;
  expiry_date: string | null;
  storage_location_id: string | null;
  canonical_food_id: string | null;
  cached_category_id: string | null;
  cached_subcategory_id: string | null;
  classification_version: number | null;
  // Embedded display names resolved via foreign keys.
  storage_location?: PantryEmbeddedRef;
  cached_category?: PantryEmbeddedRef;
  cached_subcategory?: PantryEmbeddedRef;
  created_at?: string;
  updated_at?: string;
};

export type PantryIngredientInput = {
  ingredient_name: string;
  quantity: number;
  unit: string | null;
  expiry_date: string | null;
  storage_location_id?: string | null;
};

export type ExpiryStatus =
  | "expired"
  | "today"
  | "tomorrow"
  | "soon"
  | "ok"
  | "none";
