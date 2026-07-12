"use client";

import { useState } from "react";
import { Bookmark, Heart } from "lucide-react";
import { cookMeal, saveMeal } from "@/app/actions/meals";
import { MissingIngredientsSection } from "@/components/missing-ingredients-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { ProgressBar } from "@/components/ui/progress-bar";
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

  const total =
    meal.ingredientsUsed.length + meal.missingIngredients.length;
  const matchPercent =
    total > 0
      ? Math.round((meal.ingredientsUsed.length / total) * 100)
      : 100;

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
    <Card className="pp-slide-up flex h-full flex-col p-6 sm:p-7">
      <div className="flex items-start gap-4">
        <IconTile tone="amber" size="lg">
          🍽️
        </IconTile>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            {meal.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {meal.description}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-muted">Pantry match</span>
          <Badge variant={matchPercent === 100 ? "success" : "orange"}>
            {matchPercent}%
          </Badge>
        </div>
        <ProgressBar value={matchPercent} max={100} />
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Ingredients used
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {meal.ingredientsUsed.map((ingredient) => (
              <li
                key={ingredient}
                className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        {meal.missingIngredients.length > 0 ? (
          <MissingIngredientsSection
            ingredients={meal.missingIngredients}
            label="Missing ingredients"
            buttonSize="sm"
          />
        ) : (
          <p className="text-sm font-medium text-success">
            You have everything you need.
          </p>
        )}
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="mt-auto flex flex-col gap-2 pt-6 sm:flex-row">
        <Button
          type="button"
          onClick={() => void handleCook()}
          disabled={isCooking || meal.ingredientsUsed.length === 0}
          className="sm:flex-1"
          size="lg"
        >
          {isCooking ? "Updating pantry…" : "Cook Tonight"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void handleSave()}
          disabled={isSaving || saved}
          className="gap-2 sm:flex-1"
          size="lg"
        >
          {saved ? (
            <Heart
              className="h-4 w-4 fill-rose-500 text-rose-500"
              style={{ animation: "pp-heart 0.4s ease" }}
              aria-hidden="true"
            />
          ) : (
            <Bookmark className="h-4 w-4" aria-hidden="true" />
          )}
          {saved ? "Saved" : isSaving ? "Saving…" : "Save"}
        </Button>
      </div>
    </Card>
  );
}
