import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { planMissingIngredientsForShoppingList } from "../src/lib/add-missing-ingredients-core.mjs";

const shoppingListAction = readFileSync(
  new URL("../src/app/actions/shopping-list.ts", import.meta.url),
  "utf8"
);
const shoppingAction = readFileSync(
  new URL("../src/app/actions/shopping.ts", import.meta.url),
  "utf8"
);
const addMissingButton = readFileSync(
  new URL("../src/components/add-missing-to-shopping-button.tsx", import.meta.url),
  "utf8"
);
const sharedMissingSection = readFileSync(
  new URL("../src/components/missing-ingredients-section.tsx", import.meta.url),
  "utf8"
);
const v2Types = readFileSync(
  new URL("../src/types/v2.ts", import.meta.url),
  "utf8"
);
const pantryCategories = readFileSync(
  new URL("../src/lib/pantry-categories.ts", import.meta.url),
  "utf8"
);

const entryPointFiles = {
  planner: "../src/components/meal-planner.tsx",
  recipePageCard: "../src/components/recipe-catalog.tsx",
  recipeDetail: "../src/components/recipe-detail-modal.tsx",
  mealSuggestionCard: "../src/components/meal-card.tsx",
  savedMeals: "../src/components/saved-meals-list.tsx",
};

function normalizeKey(name) {
  return name.trim().toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ");
}

function categorizeIngredient(name) {
  const n = name.toLowerCase();
  if (n.includes("basil")) return "Herbs & Spices";
  if (n.includes("garlic")) return "Produce";
  return "Unclassified";
}

function plan(overrides = {}) {
  return planMissingIngredientsForShoppingList({
    ingredients: [],
    pantryNames: [],
    existingShoppingNames: [],
    userId: "user-1",
    normalizeKey,
    isInPantry: () => false,
    categorizeIngredient,
    ...overrides,
  });
}

function exportedFunctionBody(source, functionName) {
  const start = source.indexOf(`export async function ${functionName}`);
  assert.notEqual(start, -1, `${functionName} should exist`);

  const braceStart = source.indexOf("{", start);
  assert.notEqual(braceStart, -1, `${functionName} should have a body`);

  let depth = 0;
  for (let i = braceStart; i < source.length; i += 1) {
    const char = source[i];
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) {
      return source.slice(braceStart + 1, i);
    }
  }

  assert.fail(`${functionName} body was not closed`);
}

test("recipe-level Add Missing Items never invokes weekly shopping regeneration", () => {
  assert.doesNotMatch(
    shoppingListAction,
    /@\/app\/actions\/shopping/,
    "recipe-level action must not import planner-wide shopping actions"
  );
  assert.doesNotMatch(
    shoppingListAction,
    /regenerateShoppingList|triggerShoppingListRegeneration/,
    "recipe-level action must not regenerate or merge the weekly meal-plan list"
  );
  assert.match(
    shoppingListAction,
    /buildFoodResolver/,
    "recipe-level action should compare recipe ingredients with pantry semantically"
  );
});

test("shopping page read action is read-only and does not regenerate weekly list", () => {
  const body = exportedFunctionBody(shoppingAction, "getShoppingList");

  assert.doesNotMatch(
    body,
    /regenerateShoppingList|triggerShoppingListRegeneration|fetchActivePlanItems|computeShoppingList/,
    "getShoppingList must read persisted rows only"
  );
  assert.match(
    body,
    /\.from\("shopping_list_items"\)/,
    "getShoppingList should fetch the current persisted shopping list"
  );
});

test("multiple missing ingredients are all planned for insertion", () => {
  const result = plan({
    ingredients: ["Garlic", "Fresh Basil"],
  });

  assert.deepEqual(
    result.toInsert.map((item) => item.ingredient_name),
    ["Garlic", "Fresh Basil"]
  );
  assert.equal(result.added, 2);
  assert.equal(result.toInsert[1].category, "Herbs & Spices");
});

test("semantic match skips ingredients already covered by pantry", () => {
  const result = plan({
    ingredients: ["Pasta"],
    pantryNames: ["Macaroni"],
    isInPantry: (ingredient, pantryNames) =>
      ingredient === "Pasta" && pantryNames.includes("Macaroni"),
  });

  assert.equal(result.added, 0);
  assert.equal(result.skippedPantry, 1);
  assert.deepEqual(result.toInsert, []);
});

test("semantic non-match inserts the missing ingredient", () => {
  const result = plan({
    ingredients: ["Garlic"],
    pantryNames: ["Onion"],
    isInPantry: () => false,
  });

  assert.deepEqual(
    result.toInsert.map((item) => item.ingredient_name),
    ["Garlic"]
  );
});

test("unknown unresolved ingredients fall back to original display name", () => {
  const result = plan({
    ingredients: ["Fresh Basil"],
    isInPantry: () => false,
  });

  assert.equal(result.added, 1);
  assert.equal(result.toInsert[0].ingredient_name, "Fresh Basil");
  assert.equal(result.toInsert[0].category, "Herbs & Spices");
});

test("running Add Missing twice does not create duplicates", () => {
  const first = plan({
    ingredients: ["Garlic", "Fresh Basil"],
  });
  const second = plan({
    ingredients: ["Garlic", "Fresh Basil"],
    existingShoppingNames: first.toInsert.map((item) => item.ingredient_name),
  });

  assert.equal(first.added, 2);
  assert.equal(second.added, 0);
  assert.equal(second.skippedExisting, 2);
});

test("all UI entry points use the shared MissingIngredientsSection", () => {
  assert.match(
    sharedMissingSection,
    /AddMissingToShoppingButton/,
    "shared section should be the only component that renders the add button"
  );
  assert.match(
    addMissingButton,
    /addMissingIngredientsToShoppingList/,
    "shared button should call the canonical server action"
  );

  for (const [name, path] of Object.entries(entryPointFiles)) {
    const source = readFileSync(new URL(path, import.meta.url), "utf8");
    assert.match(
      source,
      /MissingIngredientsSection/,
      `${name} should use the shared missing-ingredients component`
    );
    assert.doesNotMatch(
      source,
      /addMissingIngredientsToShoppingList|AddMissingToShoppingButton/,
      `${name} should not bypass the shared missing-ingredients component`
    );
  }
});

test("shopping UI renders every category emitted by ingredient categorisation", () => {
  for (const category of [
    "Produce",
    "Meat",
    "Dairy",
    "Bakery",
    "Frozen",
    "Cupboard",
    "Herbs & Spices",
    "Drinks",
    "Unclassified",
  ]) {
    assert.ok(
      pantryCategories.includes(`"${category}"`),
      `${category} should be a possible categorizeIngredient category`
    );
    assert.ok(
      v2Types.includes(`"${category}"`),
      `${category} should be rendered by SHOPPING_CATEGORIES`
    );
  }
});
