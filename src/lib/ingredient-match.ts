/**
 * Normalises an ingredient name for comparison.
 * Trims whitespace, lowercases, and strips punctuation.
 */
export function normalizeIngredientForMatch(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Returns true when two ingredient names refer to the same item.
 * Uses exact normalised match, then reasonable substring matching.
 */
export function ingredientsMatch(required: string, pantryName: string): boolean {
  const a = normalizeIngredientForMatch(required);
  const b = normalizeIngredientForMatch(pantryName);

  if (!a || !b) {
    return false;
  }

  if (a === b) {
    return true;
  }

  if (a.length >= 4 && b.length >= 4) {
    return b.includes(a) || a.includes(b);
  }

  return false;
}

export type ParsedIngredient = {
  name: string;
  quantity: number | null;
  unit: string | null;
};

const LEADING_QTY_PATTERN =
  /^(\d+(?:\.\d+)?)\s*([a-z]+)?\s+(.+)$/i;
const TRAILING_QTY_PATTERN =
  /^(.+?)\s+(\d+(?:\.\d+)?)\s*([a-z]+)?$/i;

/**
 * Attempts to parse a quantity and unit from a free-text ingredient string.
 * Returns quantity null when no reliable quantity is found.
 */
export function parseIngredientRequirement(raw: string): ParsedIngredient {
  const trimmed = raw.trim();

  if (!trimmed) {
    return { name: "", quantity: null, unit: null };
  }

  const leading = trimmed.match(LEADING_QTY_PATTERN);
  if (leading) {
    const quantity = Number.parseFloat(leading[1]);
    const possibleUnit = leading[2]?.toLowerCase();
    const name = leading[3].trim();
    const knownUnits = new Set([
      "g",
      "kg",
      "ml",
      "l",
      "litre",
      "litres",
      "liter",
      "liters",
      "count",
      "pack",
      "pcs",
    ]);

    if (knownUnits.has(possibleUnit ?? "")) {
      return {
        name,
        quantity: Number.isFinite(quantity) ? quantity : null,
        unit: possibleUnit ?? null,
      };
    }

    return {
      name: `${possibleUnit} ${name}`.trim(),
      quantity: Number.isFinite(quantity) ? quantity : null,
      unit: null,
    };
  }

  const trailing = trimmed.match(TRAILING_QTY_PATTERN);
  if (trailing) {
    const quantity = Number.parseFloat(trailing[2]);
    return {
      name: trailing[1].trim(),
      quantity: Number.isFinite(quantity) ? quantity : null,
      unit: trailing[3]?.toLowerCase() ?? null,
    };
  }

  return { name: trimmed, quantity: null, unit: null };
}

export function unitsAreCompatible(
  a: string | null,
  b: string | null
): boolean {
  if (!a || !b) {
    return a === b;
  }

  const normalise = (unit: string) => {
    const u = unit.toLowerCase();
    if (u === "l" || u === "liter" || u === "liters") return "litre";
    if (u === "litres") return "litre";
    return u;
  };

  return normalise(a) === normalise(b);
}
