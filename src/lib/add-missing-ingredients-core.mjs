/**
 * Canonical planner for recipe/meal "Add Missing Ingredients" actions.
 *
 * This module is intentionally side-effect free: the server action owns auth,
 * semantic resolver construction, and database writes; this function owns the
 * single decision path for dedupe, pantry comparison, existing-list protection,
 * and insert-row construction.
 */
export function planMissingIngredientsForShoppingList({
  ingredients,
  pantryNames,
  existingShoppingNames,
  userId,
  normalizeKey,
  isInPantry,
  categorizeIngredient,
  parseIngredient = (raw) => ({
    name: raw.trim(),
    quantity: /** @type {number | null} */ (null),
    unit: /** @type {string | null} */ (null),
  }),
}) {
  const uniqueIngredients = new Map();

  for (const raw of ingredients) {
    const trimmed = raw.trim();
    if (!trimmed) {
      continue;
    }

    const parsed = parseIngredient(trimmed);
    const name = parsed.name?.trim();
    if (!name) {
      continue;
    }

    const key = normalizeKey(name);
    if (!uniqueIngredients.has(key)) {
      uniqueIngredients.set(key, {
        name,
        quantity: parsed.quantity,
        unit: parsed.unit,
      });
    }
  }

  const existingShoppingKeys = new Set(
    existingShoppingNames.map((name) => normalizeKey(name))
  );

  const toInsert = [];
  let skippedPantry = 0;
  let skippedExisting = 0;

  for (const ingredient of uniqueIngredients.values()) {
    const key = normalizeKey(ingredient.name);
    const buyQuantity = ingredient.quantity ?? 1;
    const buyUnit = ingredient.unit ?? null;

    if (isInPantry(ingredient.name, pantryNames)) {
      skippedPantry += 1;
      continue;
    }

    if (existingShoppingKeys.has(key)) {
      skippedExisting += 1;
      continue;
    }

    toInsert.push({
      user_id: userId,
      ingredient_name: ingredient.name,
      quantity: buyQuantity,
      unit: buyUnit,
      category: categorizeIngredient(ingredient.name),
      checked: false,
      needed_for_meals: 1,
      shortage_label: null,
      demand_quantity: buyQuantity,
      demand_unit: buyUnit,
      pantry_quantity: 0,
      pantry_unit: buyUnit,
      used_by_meals: [],
      source: "manual",
    });

    existingShoppingKeys.add(key);
  }

  return {
    toInsert,
    added: toInsert.length,
    skippedExisting,
    skippedPantry,
  };
}
