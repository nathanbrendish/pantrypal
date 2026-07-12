"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { cookMeal, saveMeal } from "@/app/actions/meals";
import { MissingIngredientsSection } from "@/components/missing-ingredients-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Meal } from "@/types/meals";

type MealCardProps = {
  meal: Meal;
  onCooked: () => void;
  onSaved?: () => void;
};

export function MealCard({ meal, onCooked, onSaved }: MealCardProps) {
  const [isCooking, setIsCooking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleCook = async () => {
    setIsCooking(true);
    setError(null);

    try {
      const result = await cookMeal(meal.ingredientsUsed);

      if (!result.success) {
        setError(result.error);
        setIsCooking(false);
        return;
      }

      onCooked();
    } catch {
      setError("Failed to update your pantry. Please try again.");
      setIsCooking(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const result = await saveMeal({
        name: meal.name,
        description: meal.description,
        ingredientsUsed: meal.ingredientsUsed,
        missingIngredients: meal.missingIngredients,
      });

      if (!result.success) {
        setError(result.error);
        setIsSaving(false);
        return;
      }

      setSaved(true);
      onSaved?.();
    } catch {
      setError("Failed to save meal. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <Card className="flex h-full flex-col p-6">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {meal.name}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        {meal.description}
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Ingredients Used
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {meal.ingredientsUsed.map((ingredient) => (
              <li
                key={ingredient}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300"
              >
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        {meal.missingIngredients.length > 0 ? (
          <MissingIngredientsSection
            ingredients={meal.missingIngredients}
            label="Missing Ingredients"
            buttonSize="sm"
          />
        ) : (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Missing Ingredients
            </p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              No additional ingredients needed
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          onClick={() => void handleCook()}
          disabled={isCooking || meal.ingredientsUsed.length === 0}
          className="sm:flex-1"
        >
          {isCooking ? "Updating pantry…" : "I Cooked This"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void handleSave()}
          disabled={isSaving || saved}
          className="gap-2 sm:flex-1"
        >
          <Bookmark className="h-4 w-4" aria-hidden="true" />
          {saved ? "Saved" : isSaving ? "Saving…" : "Save For Later"}
        </Button>
      </div>
    </Card>
  );
}
