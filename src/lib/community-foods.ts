import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CommunityFoodDefaults,
  CommunityFoodObservation,
} from "@/types/community-intelligence";

type CommunityFoodRpcClient = Pick<SupabaseClient, "rpc">;

export async function recordCommunityFoodObservation(
  supabase: CommunityFoodRpcClient,
  observation: CommunityFoodObservation
): Promise<void> {
  const { error } = await supabase.rpc("record_community_food_observation", {
    observed_name: observation.name,
    observed_category: observation.category?.trim() || null,
    observed_subcategory: observation.subcategory?.trim() || null,
    observed_unit: observation.unit?.trim() || null,
    observed_shelf_life_days: observation.shelfLifeDays ?? null,
    observed_fridge_days: observation.fridgeDays ?? null,
    observed_freezer_days: observation.freezerDays ?? null,
  });

  if (error) {
    throw new Error(`Community observation failed: ${error.message}`);
  }
}

export async function getVerifiedCommunityFoodDefaults(
  supabase: CommunityFoodRpcClient,
  name: string
): Promise<CommunityFoodDefaults | null> {
  const { data, error } = await supabase.rpc("get_verified_community_food", {
    search_name: name,
  });

  if (error) {
    throw new Error(`Community food lookup failed: ${error.message}`);
  }

  const result = Array.isArray(data) ? data[0] : null;
  return (result as CommunityFoodDefaults | undefined) ?? null;
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
