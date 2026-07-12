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
}) {
  const uniqueIngredients = new Map();

  for (const raw of ingredients) {
    const trimmed = raw.trim();
    if (!trimmed) {
      continue;
    }

    const key = normalizeKey(trimmed);
    if (!uniqueIngredients.has(key)) {
      uniqueIngredients.set(key, trimmed);
    }
  }

  const existingShoppingKeys = new Set(
    existingShoppingNames.map((name) => normalizeKey(name))
  );

  const toInsert = [];
  let skippedPantry = 0;
  let skippedExisting = 0;

  for (const ingredient of uniqueIngredients.values()) {
    const key = normalizeKey(ingredient);

    if (isInPantry(ingredient, pantryNames)) {
      skippedPantry += 1;
      continue;
    }

    if (existingShoppingKeys.has(key)) {
      skippedExisting += 1;
      continue;
    }

    toInsert.push({
      user_id: userId,
      ingredient_name: ingredient,
      quantity: null,
      unit: null,
      category: categorizeIngredient(ingredient),
      checked: false,
      needed_for_meals: 1,
      shortage_label: null,
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
