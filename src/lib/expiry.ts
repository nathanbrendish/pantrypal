export function addDays(date: Date, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().slice(0, 10);
}

export function inferExpiryDate(ingredientName: string): string | null {
  const name = ingredientName.toLowerCase();
  const today = new Date();

  if (
    name.includes("milk") ||
    name.includes("cream") ||
    name.includes("yogurt")
  ) {
    return addDays(today, 7);
  }

  if (
    name.includes("chicken") ||
    name.includes("turkey") ||
    name.includes("pork") ||
    name.includes("beef") ||
    name.includes("mince") ||
    name.includes("sausage")
  ) {
    return addDays(today, 3);
  }

  if (
    name.includes("fish") ||
    name.includes("salmon") ||
    name.includes("prawn") ||
    name.includes("shrimp") ||
    name.includes("cod") ||
    name.includes("tuna")
  ) {
    return addDays(today, 2);
  }

  if (name.includes("bread") || name.includes("roll") || name.includes("bun")) {
    return addDays(today, 5);
  }

  if (
    name.includes("apple") ||
    name.includes("banana") ||
    name.includes("berry") ||
    name.includes("lettuce") ||
    name.includes("spinach") ||
    name.includes("tomato") ||
    name.includes("cucumber") ||
    name.includes("pepper") ||
    name.includes("carrot") ||
    name.includes("broccoli") ||
    name.includes("fruit") ||
    name.includes("vegetable") ||
    name.includes("salad") ||
    name.includes("mushroom") ||
    name.includes("onion") ||
    name.includes("potato")
  ) {
    return addDays(today, 5);
  }

  if (name.includes("egg")) {
    return addDays(today, 14);
  }

  if (name.includes("cheese")) {
    return addDays(today, 10);
  }

  return null;
}

export function getExpiryStatus(
  expiryDate: string | null
): import("@/types/pantry").ExpiryStatus {
  if (!expiryDate) {
    return "none";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(`${expiryDate}T00:00:00`);
  const diffDays = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "expired";
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  if (diffDays <= 3) return "soon";
  return "ok";
}

export function formatExpiryLabel(expiryDate: string | null): string {
  if (!expiryDate) return "No expiry";

  const status = getExpiryStatus(expiryDate);
  const formatted = new Date(`${expiryDate}T00:00:00`).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short", year: "numeric" }
  );

  switch (status) {
    case "expired":
      return `Expired ${formatted}`;
    case "today":
      return "Expires today";
    case "tomorrow":
      return "Expires tomorrow";
    case "soon":
      return `Expires ${formatted}`;
    default:
      return formatted;
  }
}
