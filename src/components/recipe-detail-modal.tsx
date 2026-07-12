"use client";

import { useState } from "react";
import { Bookmark, ChefHat, Loader2, X } from "lucide-react";
import { cookMeal, saveMeal } from "@/app/actions/meals";
import { MissingIngredientsSection } from "@/components/missing-ingredients-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { matchRecipeToPantry, type PantryForMatching } from "@/lib/recipe-match";
import type { FoodResolver } from "@/lib/semantic-match";
import type { Recipe } from "@/types/recipes";

type RecipeDetailModalProps = {
  recipe: Recipe;
  pantry: PantryForMatching[];
  resolver?: FoodResolver | null;
  onClose: () => void;
  onCooked?: () => void;
  showSave?: boolean;
  initiallySaved?: boolean;
};

export function RecipeDetailModal({
  recipe,
  pantry,
  resolver = null,
  onClose,
  onCooked,
  showSave = true,
  initiallySaved = false,
}: RecipeDetailModalProps) {
  const match = matchRecipeToPantry(recipe, pantry, resolver);
  const matchPercent = Math.round(match.matchScore);
  const [isCooking, setIsCooking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(initiallySaved);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCook = async () => {
    setIsCooking(true);
    setError(null);
    setSuccess(null);

    const result = await cookMeal(match.ingredientsUsed);

    if (!result.success) {
      setError(result.error);
      setIsCooking(false);
      return;
    }

    setSuccess("Pantry updated — enjoy your meal!");
    setIsCooking(false);
    onCooked?.();
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    const result = await saveMeal({
      name: recipe.name,
      description: recipe.description,
      ingredientsUsed: match.ingredientsUsed,
      missingIngredients: match.missingIngredients,
    });

    if (!result.success) {
      setError(result.error);
      setIsSaving(false);
      return;
    }

    setSaved(true);
    setSuccess("Saved for later.");
    setIsSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <Card
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted hover:bg-background hover:text-foreground"
          aria-label="Close recipe"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="pr-10 text-xl font-bold text-foreground">{recipe.name}</h2>
        <p className="mt-2 text-sm text-muted">{recipe.description}</p>
        <p className="mt-3 text-sm text-muted">
          {recipe.difficulty} · {recipe.prep_time} min · {recipe.category}
        </p>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-muted">Pantry match</span>
            <Badge variant={matchPercent >= 80 ? "success" : "orange"}>
              {matchPercent}%
            </Badge>
          </div>
          <ProgressBar value={matchPercent} max={100} />
        </div>

        <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted">
          Ingredients
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-foreground">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={ingredient}>
              {recipe.typical_quantities[index]
                ? `${recipe.typical_quantities[index]} `
                : ""}
              {ingredient}
            </li>
          ))}
        </ul>

        {match.missingIngredients.length > 0 && (
          <div className="mt-6">
            <MissingIngredientsSection
              ingredients={match.missingIngredients}
              buttonSize="sm"
            />
          </div>
        )}

        {recipe.instructions.length > 0 && (
          <>
            <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted">
              Cooking instructions
            </h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-foreground">
              {recipe.instructions.map((step, index) => (
                <li key={`${recipe.id}-step-${index}`}>{step}</li>
              ))}
            </ol>
          </>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {success && (
          <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400">
            {success}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={() => void handleCook()}
            disabled={isCooking || match.ingredientsUsed.length === 0}
            className="sm:flex-1"
          >
            {isCooking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating pantry…
              </>
            ) : (
              <>
                <ChefHat className="h-4 w-4" />
                Mark as cooked
              </>
            )}
          </Button>
          {showSave && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => void handleSave()}
              disabled={isSaving || saved}
              className="sm:flex-1"
            >
              <Bookmark className="h-4 w-4" />
              {saved ? "Saved" : isSaving ? "Saving…" : "Save for later"}
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
