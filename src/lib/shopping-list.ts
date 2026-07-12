import {
  normalizeIngredientForMatch,
  parseIngredientRequirement,
  unitsAreCompatible,
  type ParsedIngredient,
} from "@/lib/ingredient-match";
import { foodsMatch, type FoodResolver } from "@/lib/semantic-match";
import { categorizeIngredient, formatQuantity } from "@/lib/shopping-utils";
import type { MealPlanItem } from "@/types/v2";

export type PantryStock = {
  ingredient_name: string;
  quantity: number;
  unit: string | null;
};

export type ComputedShoppingEntry = {
  ingredient_name: string;
  quantity: number | null;
  unit: string | null;
  category: string;
  needed_for_meals: number;
  shortage_label: string | null;
  demand_quantity: number | null;
  demand_unit: string | null;
  pantry_quantity: number | null;
  pantry_unit: string | null;
  used_by_meals: string[];
};

type AggregatedRequirement = {
  displayName: string;
  quantity: number;
  unit: string | null;
  needed_for_meals: number;
  used_by_meals: Set<string>;
};

type MealRequirement = Omit<ParsedIngredient, "quantity"> & {
  quantity: number;
  mealName: string;
};

function collectMealRequirements(
  meal: MealPlanItem
): MealRequirement[] {
  const seen = new Set<string>();
  const requirements: MealRequirement[] = [];

  const allIngredients = [
    ...meal.ingredients_used,
    ...meal.missing_ingredients,
  ];

  for (const raw of allIngredients) {
    const parsed = parseIngredientRequirement(raw);
    if (!parsed.name) {
      continue;
    }

    const key = normalizeIngredientForMatch(parsed.name);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    requirements.push({
      ...parsed,
      quantity: parsed.quantity ?? 1,
      mealName: meal.meal_name,
    });
  }

  return requirements;
}

function findDemandGroup(
  groups: AggregatedRequirement[],
  requirement: MealRequirement,
  resolver?: FoodResolver | null
): AggregatedRequirement | null {
  return (
    groups.find(
      (group) =>
        foodsMatch(group.displayName, requirement.name, resolver) &&
        unitsAreCompatible(group.unit, requirement.unit)
    ) ?? null
  );
}

function aggregateRequirements(
  meals: MealPlanItem[],
  resolver?: FoodResolver | null
): AggregatedRequirement[] {
  const aggregated: AggregatedRequirement[] = [];

  for (const meal of meals) {
    const requirements = collectMealRequirements(meal);

    for (const req of requirements) {
      const existing = findDemandGroup(aggregated, req, resolver);

      if (!existing) {
        aggregated.push({
          displayName: req.name,
          quantity: req.quantity,
          unit: req.unit,
          needed_for_meals: 1,
          used_by_meals: new Set([req.mealName]),
        });
        continue;
      }

      existing.needed_for_meals += 1;
      existing.quantity += req.quantity;
      existing.used_by_meals.add(req.mealName);
    }
  }

  return aggregated;
}

function pantrySupplyForRequirement(
  requirement: AggregatedRequirement,
  pantry: PantryStock[],
  resolver?: FoodResolver | null
): { quantity: number; unit: string | null } {
  let quantity = 0;
  let unit: string | null = requirement.unit;

  for (const item of pantry) {
    if (
      foodsMatch(requirement.displayName, item.ingredient_name, resolver) &&
      unitsAreCompatible(requirement.unit, item.unit)
    ) {
      quantity += item.quantity ?? 0;
      unit = requirement.unit ?? item.unit;
    }
  }

  return { quantity, unit };
}

/**
 * The parsed ingredient names a meal plan requires. Used to build a semantic
 * resolver covering exactly the strings `computeShoppingList` will match.
 */
export function collectShoppingRequirementNames(
  meals: MealPlanItem[]
): string[] {
  return aggregateRequirements(meals).map(
    (requirement) => requirement.displayName
  );
}

function buildShortageLabel(
  shortage: number,
  unit: string | null
): string {
  const formatted = formatQuantity(shortage, unit);
  return formatted ? `Need ${formatted} more` : `Need ${shortage} more`;
}

/**
 * Builds the shopping list from the active meal plan and current pantry.
 * Pantry is the single source of truth — no AI involved.
 */
export function computeShoppingList(
  meals: MealPlanItem[],
  pantry: PantryStock[],
  resolver?: FoodResolver | null
): ComputedShoppingEntry[] {
  if (meals.length === 0) {
    return [];
  }

  const aggregated = aggregateRequirements(meals, resolver);
  const results: ComputedShoppingEntry[] = [];

  for (const requirement of aggregated) {
    const pantrySupply = pantrySupplyForRequirement(requirement, pantry, resolver);
    const shortage = Math.max(0, requirement.quantity - pantrySupply.quantity);

    if (shortage <= 0) {
      continue;
    }

    const unit = requirement.unit ?? pantrySupply.unit;

    results.push({
      ingredient_name: requirement.displayName,
      quantity: shortage,
      unit,
      category: categorizeIngredient(requirement.displayName),
      needed_for_meals: requirement.needed_for_meals,
      shortage_label: buildShortageLabel(shortage, unit),
      demand_quantity: requirement.quantity,
      demand_unit: requirement.unit,
      pantry_quantity: pantrySupply.quantity,
      pantry_unit: pantrySupply.unit,
      used_by_meals: Array.from(requirement.used_by_meals),
    });
  }

  return results.sort((a, b) => {
    const categoryOrder =
      a.category.localeCompare(b.category) ||
      a.ingredient_name.localeCompare(b.ingredient_name);
    return categoryOrder;
  });
}

export type ShoppingListSummary = {
  totalItems: number;
  totalCategories: number;
  hasMealPlan: boolean;
  allIngredientsCovered: boolean;
};

export function buildShoppingSummary(
  items: ComputedShoppingEntry[],
  hasMealPlan: boolean
): ShoppingListSummary {
  const categories = new Set(items.map((item) => item.category));

  return {
    totalItems: items.length,
    totalCategories: categories.size,
    hasMealPlan,
    allIngredientsCovered: hasMealPlan && items.length === 0,
  };
}
