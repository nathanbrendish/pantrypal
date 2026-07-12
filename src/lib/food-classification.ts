import type { ClassificationTier } from "@/types/taxonomy";

export const CONFIDENCE_THRESHOLDS = {
  verified: 95,
  community: 75,
  learning: 40,
} as const;

export const UNCLASSIFIED_LABEL = "Unclassified";

/**
 * Derives the classification tier from a community confidence score.
 * The tier is never stored; it is always derived from the single source of truth.
 * Below the learning threshold a food has no category (Unclassified).
 */
export function tierFromConfidence(
  score: number | null | undefined
): ClassificationTier {
  const value = typeof score === "number" && Number.isFinite(score) ? score : 0;

  if (value >= CONFIDENCE_THRESHOLDS.verified) {
    return "verified";
  }
  if (value >= CONFIDENCE_THRESHOLDS.community) {
    return "community";
  }
  if (value >= CONFIDENCE_THRESHOLDS.learning) {
    return "learning";
  }
  return "unclassified";
}

const TIER_LABELS: Record<ClassificationTier, string> = {
  verified: "Verified",
  community: "Community",
  learning: "Learning",
  unclassified: "Unclassified",
};

export function tierLabel(tier: ClassificationTier): string {
  return TIER_LABELS[tier];
}

const TIER_BADGE_CLASSES: Record<ClassificationTier, string> = {
  verified:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  community:
    "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
  learning:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  unclassified:
    "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400",
};

export function tierBadgeClasses(tier: ClassificationTier): string {
  return TIER_BADGE_CLASSES[tier];
}

/**
 * True when a food's classification is uncertain enough that the app should
 * (eventually, never at add time) invite the user to classify it.
 */
export function isUnclassified(
  categoryId: string | null | undefined
): boolean {
  return !categoryId;
}
