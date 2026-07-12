import type {
  FoodCategory,
  FoodSubcategory,
  StorageLocation,
} from "@/types/taxonomy";

export const PLATFORM_ROLES = ["USER", "SUPER_ADMIN"] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export type CommunityFoodStatus = "candidate" | "verified" | "locked";

export type CommunityFoodDefaults = {
  id: string;
  canonical_name: string;
  primary_category: string | null;
  secondary_category: string | null;
  default_unit: string | null;
  default_shelf_life_days: number | null;
  default_fridge_life_days: number | null;
  default_freezer_life_days: number | null;
};

export type CommunityFoodObservation = {
  name: string;
  category?: string | null;
  subcategory?: string | null;
  unit?: string | null;
  shelfLifeDays?: number | null;
  fridgeDays?: number | null;
  freezerDays?: number | null;
};

export type CommunityFoodRecord = {
  id: string;
  canonical_name: string;
  normalized_name: string;
  // Deprecated free-text columns, retained until the cleanup migration.
  primary_category: string | null;
  secondary_category: string | null;
  // Controlled-taxonomy references (source of truth for classification).
  food_category_id: string | null;
  food_subcategory_id: string | null;
  classification_version: number;
  taxonomy_version: number;
  default_unit: string | null;
  default_shelf_life_days: number | null;
  default_fridge_life_days: number | null;
  default_freezer_life_days: number | null;
  usage_count: number;
  alias_count: number;
  confidence_score: number;
  status: CommunityFoodStatus;
  review_required: boolean;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CommunityFoodAlias = {
  id: string;
  community_food_id: string;
  alias: string;
  normalized_alias: string;
  usage_count: number;
  created_at: string;
};

export type CommunityFoodVote = {
  id: string;
  community_food_id: string;
  category: string | null;
  subcategory: string | null;
  food_category_id: string | null;
  food_subcategory_id: string | null;
  storage_location_id: string | null;
  unit: string | null;
  shelf_life_days: number | null;
  fridge_days: number | null;
  freezer_days: number | null;
  created_at: string;
};

export type CommunityFoodModerationAction =
  | "approved"
  | "rejected"
  | "merged"
  | "locked"
  | "edited";

export type CommunityFoodModerationHistory = {
  id: string;
  community_food_id: string;
  action: CommunityFoodModerationAction;
  actor_user_id: string;
  target_community_food_id: string | null;
  before_values: Record<string, unknown>;
  after_values: Record<string, unknown>;
  created_at: string;
};

export type CommunityConfidenceBreakdown = {
  usageScore: number;
  categoryAgreement: number;
  unitAgreement: number;
  shelfLifeAgreement: number;
  score: number;
};

export type CommunityDashboardMetrics = {
  totalFoods: number;
  candidates: number;
  awaitingReview: number;
  verified: number;
  locked: number;
};

export type CommunityIntelligenceDashboardData = {
  metrics: CommunityDashboardMetrics;
  foods: CommunityFoodRecord[];
  topAliases: CommunityFoodAlias[];
  moderationHistory: CommunityFoodModerationHistory[];
  confidenceBreakdowns: Record<string, CommunityConfidenceBreakdown>;
  categories: FoodCategory[];
  subcategories: FoodSubcategory[];
  storageLocations: StorageLocation[];
};
