import {
  ingredientsMatch,
  normalizeIngredientForMatch,
  parseIngredientRequirement,
  unitsAreCompatible,
  type ParsedIngredient,
} from "@/lib/ingredient-match";
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
};

type AggregatedRequirement = {
  displayName: string;
  quantity: number | null;
  unit: string | null;
  needed_for_meals: number;
};

function collectMealRequirements(
  meal: MealPlanItem
): ParsedIngredient[] {
  const seen = new Set<string>();
  const requirements: ParsedIngredient[] = [];

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
    requirements.push(parsed);
  }

  return requirements;
}

function aggregateRequirements(
  meals: MealPlanItem[]
): Map<string, AggregatedRequirement> {
  const aggregated = new Map<string, AggregatedRequirement>();

  for (const meal of meals) {
    const requirements = collectMealRequirements(meal);

    for (const req of requirements) {
      const key = normalizeIngredientForMatch(req.name);
      const existing = aggregated.get(key);

      if (!existing) {
        aggregated.set(key, {
          displayName: req.name,
          quantity: req.quantity,
          unit: req.unit,
          needed_for_meals: 1,
        });
        continue;
      }

      existing.needed_for_meals += 1;

      if (
        req.quantity !== null &&
        existing.quantity !== null &&
        unitsAreCompatible(existing.unit, req.unit)
      ) {
        existing.quantity += req.quantity;
      } else if (req.quantity !== null && existing.quantity === null) {
        existing.quantity = req.quantity;
        existing.unit = req.unit;
      } else if (req.quantity === null) {
        existing.quantity = null;
        existing.unit = null;
      }
    }
  }

  return aggregated;
}

function findPantryMatch(
  requirement: AggregatedRequirement,
  pantry: PantryStock[]
): PantryStock | null {
  for (const item of pantry) {
    if (ingredientsMatch(requirement.displayName, item.ingredient_name)) {
      return item;
    }
  }

  return null;
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
  pantry: PantryStock[]
): ComputedShoppingEntry[] {
  if (meals.length === 0) {
    return [];
  }

  const aggregated = aggregateRequirements(meals);
  const results: ComputedShoppingEntry[] = [];

  for (const requirement of aggregated.values()) {
    const pantryMatch = findPantryMatch(requirement, pantry);

    if (!pantryMatch) {
      results.push({
        ingredient_name: requirement.displayName,
        quantity: requirement.quantity,
        unit: requirement.unit,
        category: categorizeIngredient(requirement.displayName),
        needed_for_meals: requirement.needed_for_meals,
        shortage_label: null,
      });
      continue;
    }

    if (requirement.quantity === null) {
      continue;
    }

    const pantryQty = pantryMatch.quantity ?? 0;

    if (
      unitsAreCompatible(requirement.unit, pantryMatch.unit) &&
      pantryQty >= requirement.quantity
    ) {
      continue;
    }

    const shortage = Math.max(0, requirement.quantity - pantryQty);

    if (shortage <= 0) {
      continue;
    }

    results.push({
      ingredient_name: requirement.displayName,
      quantity: shortage,
      unit: requirement.unit ?? pantryMatch.unit,
      category: categorizeIngredient(requirement.displayName),
      needed_for_meals: requirement.needed_for_meals,
      shortage_label: buildShortageLabel(
        shortage,
        requirement.unit ?? pantryMatch.unit
      ),
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
