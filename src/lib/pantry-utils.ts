import { getExpiryStatus } from "@/lib/expiry";
import type { PantryItem } from "@/types/pantry";

export function sortPantryByExpiry(items: PantryItem[]): PantryItem[] {
  const priority = {
    expired: 0,
    today: 1,
    tomorrow: 2,
    soon: 3,
    ok: 4,
    none: 5,
  } as const;

  return [...items].sort((a, b) => {
    const statusA = getExpiryStatus(a.expiry_date);
    const statusB = getExpiryStatus(b.expiry_date);
    const priorityDiff = priority[statusA] - priority[statusB];

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    if (a.expiry_date && b.expiry_date) {
      return a.expiry_date.localeCompare(b.expiry_date);
    }

    return a.ingredient_name.localeCompare(b.ingredient_name);
  });
}

export function getExpiryClasses(status: ReturnType<typeof getExpiryStatus>) {
  switch (status) {
    case "expired":
      return "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30";
    case "today":
      return "border-amber-300 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30";
    case "tomorrow":
      return "border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-950/20";
    case "soon":
      return "border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/20";
    default:
      return "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900";
  }
}
