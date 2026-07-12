"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { removeSavedMeal } from "@/app/actions/meals";
import { MissingIngredientsSection } from "@/components/missing-ingredients-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { SavedMeal } from "@/types/v2";

type SavedMealsListProps = {
  meals: SavedMeal[];
};

export function SavedMealsList({ meals: initialMeals }: SavedMealsListProps) {
  const [meals, setMeals] = useState(initialMeals);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    setError(null);

    const result = await removeSavedMeal(id);

    if (!result.success) {
      setError(result.error);
      setRemovingId(null);
      return;
    }

    setMeals((current) => current.filter((meal) => meal.id !== id));
    setRemovingId(null);
  };

  if (meals.length === 0) {
    return (
      <EmptyState
        icon={<span className="text-4xl">🔖</span>}
        title="No saved meals."
        description="Save recipes you'll want again from meal suggestions or the recipe catalog."
        primaryAction={{ label: "Browse Meals", href: "/meals" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {meals.map((meal) => (
          <li key={meal.id}>
            <Card className="flex h-full flex-col p-6">
              <h3 className="text-lg font-semibold text-foreground">
                {meal.meal_name}
              </h3>
              <p className="mt-2 text-sm text-muted">
                {meal.description}
              </p>

              <div className="mt-4 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Uses
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {meal.ingredients_used.join(", ") || "None"}
                </p>
                {meal.missing_ingredients.length > 0 && (
                  <div className="mt-3">
                    <MissingIngredientsSection
                      ingredients={meal.missing_ingredients}
                      buttonSize="sm"
                    />
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="danger"
                onClick={() => void handleRemove(meal.id)}
                disabled={removingId === meal.id}
                className="mt-6 gap-2"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {removingId === meal.id ? "Removing…" : "Remove"}
              </Button>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
