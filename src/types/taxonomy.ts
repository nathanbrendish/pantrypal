export type FoodCategory = {
  id: string;
  name: string;
  icon: string | null;
  display_order: number;
  active: boolean;
  taxonomy_version: number;
};

export type FoodSubcategory = {
  id: string;
  food_category_id: string;
  name: string;
  icon: string | null;
  display_order: number;
  active: boolean;
  taxonomy_version: number;
};

export type StorageLocation = {
  id: string;
  name: string;
  icon: string | null;
  display_order: number;
  active: boolean;
};

export type ClassificationTier =
  | "verified"
  | "community"
  | "learning"
  | "unclassified";
