export const PANTRY_CATEGORIES = [
  "Produce",
  "Meat",
  "Dairy",
  "Bakery",
  "Frozen",
  "Cupboard",
  "Herbs & Spices",
  "Drinks",
  "Other",
] as const;

export type PantryCategory = (typeof PANTRY_CATEGORIES)[number];

const CATEGORY_ICONS: Record<PantryCategory, string> = {
  Produce: "🥬",
  Meat: "🥩",
  Dairy: "🧀",
  Bakery: "🍞",
  Frozen: "🧊",
  Cupboard: "🥫",
  "Herbs & Spices": "🌿",
  Drinks: "🥤",
  Other: "📦",
};

export function getCategoryIcon(category: PantryCategory): string {
  return CATEGORY_ICONS[category];
}

export function categorizeIngredient(name: string): PantryCategory {
  const n = name.toLowerCase();

  if (
    n.includes("apple") ||
    n.includes("banana") ||
    n.includes("lettuce") ||
    n.includes("tomato") ||
    n.includes("onion") ||
    n.includes("carrot") ||
    n.includes("pepper") ||
    n.includes("broccoli") ||
    n.includes("fruit") ||
    n.includes("vegetable") ||
    n.includes("salad") ||
    n.includes("potato") ||
    n.includes("mushroom") ||
    n.includes("cucumber") ||
    n.includes("spinach") ||
    n.includes("avocado") ||
    n.includes("lemon") ||
    n.includes("lime") ||
    n.includes("garlic")
  ) {
    return "Produce";
  }

  if (
    n.includes("chicken") ||
    n.includes("beef") ||
    n.includes("pork") ||
    n.includes("lamb") ||
    n.includes("bacon") ||
    n.includes("sausage") ||
    n.includes("mince") ||
    n.includes("fish") ||
    n.includes("salmon") ||
    n.includes("prawn") ||
    n.includes("turkey") ||
    n.includes("ham") ||
    n.includes("steak")
  ) {
    return "Meat";
  }

  if (
    n.includes("milk") ||
    n.includes("cheese") ||
    n.includes("butter") ||
    n.includes("yogurt") ||
    n.includes("cream") ||
    n.includes("egg")
  ) {
    return "Dairy";
  }

  if (
    n.includes("bread") ||
    n.includes("roll") ||
    n.includes("bun") ||
    n.includes("bagel") ||
    n.includes("croissant") ||
    n.includes("muffin") ||
    n.includes("wrap")
  ) {
    return "Bakery";
  }

  if (
    n.includes("frozen") ||
    n.includes("ice cream") ||
    n.includes("peas")
  ) {
    return "Frozen";
  }

  if (
    n.includes("basil") ||
    n.includes("oregano") ||
    n.includes("thyme") ||
    n.includes("rosemary") ||
    n.includes("parsley") ||
    n.includes("cumin") ||
    n.includes("paprika") ||
    n.includes("cinnamon") ||
    n.includes("spice") ||
    n.includes("herb") ||
    n.includes("chilli") ||
    n.includes("peppercorn")
  ) {
    return "Herbs & Spices";
  }

  if (
    n.includes("juice") ||
    n.includes("water") ||
    n.includes("soda") ||
    n.includes("cola") ||
    n.includes("wine") ||
    n.includes("beer") ||
    n.includes("coffee") ||
    n.includes("tea")
  ) {
    return "Drinks";
  }

  if (
    n.includes("rice") ||
    n.includes("pasta") ||
    n.includes("flour") ||
    n.includes("sugar") ||
    n.includes("oil") ||
    n.includes("sauce") ||
    n.includes("bean") ||
    n.includes("lentil") ||
    n.includes("cereal") ||
    n.includes("stock") ||
    n.includes("tin") ||
    n.includes("noodle") ||
    n.includes("couscous")
  ) {
    return "Cupboard";
  }

  return "Other";
}
