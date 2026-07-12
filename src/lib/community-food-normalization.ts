/**
 * Produces a stable, privacy-safe lookup key for community food names.
 * This mirrors the database normalizer used by anonymous observations.
 */
export function normalizeCommunityFoodName(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[\p{P}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeCommunityFoodValue(
  value: string | null | undefined
): string | null {
  const normalized = normalizeCommunityFoodName(value ?? "");
  return normalized || null;
}
