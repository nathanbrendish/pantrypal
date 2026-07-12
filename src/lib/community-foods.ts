import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClassificationTier } from "@/types/taxonomy";

type CommunityFoodRpcClient = Pick<SupabaseClient, "rpc">;

export type CommunityObservationInput = {
  name: string;
  unit?: string | null;
  shelfLifeDays?: number | null;
  fridgeDays?: number | null;
  freezerDays?: number | null;
  storageLocationId?: string | null;
  foodCategoryId?: string | null;
  foodSubcategoryId?: string | null;
};

export type CommunityObservationResult = {
  foodId: string;
  confidence: number;
  version: number;
};

export type ResolvedCommunityFood = {
  canonical_food_id: string;
  food_category_id: string | null;
  food_subcategory_id: string | null;
  confidence_score: number;
  tier: ClassificationTier;
  classification_version: number;
  suggested_storage_location_id: string | null;
  default_unit: string | null;
  default_shelf_life_days: number | null;
};

export async function recordCommunityFoodObservation(
  supabase: CommunityFoodRpcClient,
  observation: CommunityObservationInput
): Promise<CommunityObservationResult | null> {
  const { data, error } = await supabase.rpc("record_community_food_observation", {
    observed_name: observation.name,
    observed_unit: observation.unit?.trim() || null,
    observed_shelf_life_days: observation.shelfLifeDays ?? null,
    observed_fridge_days: observation.fridgeDays ?? null,
    observed_freezer_days: observation.freezerDays ?? null,
    observed_storage_location_id: observation.storageLocationId ?? null,
    observed_food_category_id: observation.foodCategoryId ?? null,
    observed_food_subcategory_id: observation.foodSubcategoryId ?? null,
  });

  if (error) {
    throw new Error(`Community observation failed: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : null;
  if (!row) {
    return null;
  }

  return {
    foodId: row.resolved_food_id as string,
    confidence: Number(row.resolved_confidence),
    version: Number(row.resolved_version),
  };
}

export async function classifyCommunityFood(
  supabase: CommunityFoodRpcClient,
  input: { name: string; foodCategoryId: string; foodSubcategoryId?: string | null }
): Promise<CommunityObservationResult | null> {
  const { data, error } = await supabase.rpc("classify_community_food", {
    observed_name: input.name,
    in_food_category_id: input.foodCategoryId,
    in_food_subcategory_id: input.foodSubcategoryId ?? null,
  });

  if (error) {
    throw new Error(`Community classification failed: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : null;
  if (!row) {
    return null;
  }

  return {
    foodId: row.resolved_food_id as string,
    confidence: Number(row.resolved_confidence),
    version: Number(row.resolved_version),
  };
}

export async function resolveCommunityFood(
  supabase: CommunityFoodRpcClient,
  name: string
): Promise<ResolvedCommunityFood | null> {
  const { data, error } = await supabase.rpc("resolve_community_food", {
    search_name: name,
  });

  if (error) {
    throw new Error(`Community food resolve failed: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : null;
  return (row as ResolvedCommunityFood | undefined) ?? null;
}

export async function getSuggestedStorageLocation(
  supabase: CommunityFoodRpcClient,
  name: string
): Promise<string | null> {
  const { data, error } = await supabase.rpc("get_suggested_storage_location", {
    search_name: name,
  });

  if (error) {
    throw new Error(`Storage suggestion failed: ${error.message}`);
  }

  return (data as string | null) ?? null;
}

export async function refreshStalePantryClassifications(
  supabase: CommunityFoodRpcClient
): Promise<number> {
  const { data, error } = await supabase.rpc(
    "refresh_stale_pantry_classifications"
  );

  if (error) {
    throw new Error(`Pantry classification refresh failed: ${error.message}`);
  }

  return Number(data ?? 0);
}

export function getExpiryDateFromDefault(
  shelfLifeDays: number | null | undefined,
  today = new Date()
): string | null {
  if (
    shelfLifeDays === null ||
    shelfLifeDays === undefined ||
    !Number.isFinite(shelfLifeDays) ||
    shelfLifeDays < 0
  ) {
    return null;
  }

  const date = new Date(today);
  date.setDate(date.getDate() + shelfLifeDays);
  return date.toISOString().slice(0, 10);
}
