import type { CommunityConfidenceBreakdown } from "@/types/community-intelligence";

type CommunityConfidenceInput = {
  usageCount: number;
  categoryAgreement: number;
  unitAgreement: number;
  shelfLifeAgreement: number;
};

function clampPercentage(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Simple, replaceable V1 confidence model:
 * 35 points for repeat use, then agreement on category, unit and shelf life.
 */
export function calculateCommunityConfidence({
  usageCount,
  categoryAgreement,
  unitAgreement,
  shelfLifeAgreement,
}: CommunityConfidenceInput): CommunityConfidenceBreakdown {
  const usageScore = Math.min(35, Math.max(0, usageCount) * 1.4);
  const safeCategoryAgreement = clampPercentage(categoryAgreement);
  const safeUnitAgreement = clampPercentage(unitAgreement);
  const safeShelfLifeAgreement = clampPercentage(shelfLifeAgreement);
  const score = clampPercentage(
    usageScore +
      safeCategoryAgreement * 0.25 +
      safeUnitAgreement * 0.2 +
      safeShelfLifeAgreement * 0.2
  );

  return {
    usageScore: Number(usageScore.toFixed(2)),
    categoryAgreement: safeCategoryAgreement,
    unitAgreement: safeUnitAgreement,
    shelfLifeAgreement: safeShelfLifeAgreement,
    score: Number(score.toFixed(2)),
  };
}

export function requiresCommunityReview({
  usageCount,
  categoryAgreement,
  unitAgreement,
  shelfLifeAgreement,
}: CommunityConfidenceInput): boolean {
  return (
    usageCount >= 25 &&
    categoryAgreement >= 90 &&
    unitAgreement >= 90 &&
    shelfLifeAgreement >= 90
  );
}
