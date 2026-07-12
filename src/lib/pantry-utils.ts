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
      return "border-expired/30 bg-expired-soft";
    case "today":
      return "border-expired/30 bg-expired-soft";
    case "tomorrow":
      return "border-expiring/30 bg-expiring-soft";
    case "soon":
      return "border-warning/30 bg-warning-soft";
    case "ok":
      return "border-fresh/20 bg-card";
    default:
      return "border-border bg-card";
  }
}
