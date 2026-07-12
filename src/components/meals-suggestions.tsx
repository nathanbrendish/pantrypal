"use client";

import { useCallback, useEffect, useState } from "react";
import { suggestMeals } from "@/app/actions/meals";
import { MealSection } from "@/components/meal-section";
import { MealSkeleton, MealsLoadingSkeleton } from "@/components/meal-skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SuccessBanner } from "@/components/ui/success-banner";
import type { MealSuggestions } from "@/types/meals";

type MealsSuggestionsProps = {
  hasIngredients: boolean;
};

export function MealsSuggestions({ hasIngredients }: MealsSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<MealSuggestions | null>(null);
  const [isLoading, setIsLoading] = useState(hasIngredients);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await suggestMeals();

    if (result.status === "empty") {
      setSuggestions(null);
      setIsLoading(false);
      return;
    }

    if (result.status === "error") {
      setError(result.message);
      setSuggestions(null);
      setIsLoading(false);
      return;
    }

    setSuggestions(result.suggestions);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (hasIngredients) {
      void loadSuggestions();
    }
  }, [hasIngredients, loadSuggestions]);

  const handleCooked = () => {
    setSuccessMessage("Enjoy your meal!");
    void loadSuggestions();
  };

  if (!hasIngredients) {
    return (
      <EmptyState
        icon={<span className="text-4xl">🥫</span>}
        title="No ingredients yet."
        description="Add ingredients to your pantry before requesting meal suggestions."
        primaryAction={{ label: "Go to Pantry", href: "/pantry" }}
        secondaryAction={{ label: "Scan receipt", href: "/receipt-scanner" }}
      />
    );
  }

  if (isLoading) {
    return <MealsLoadingSkeleton count={4} />;
  }

  if (error) {
    return (
      <Card className="px-8 py-12 text-center">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{error}</p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void loadSuggestions()}
          className="mt-6"
        >
          Try again
        </Button>
      </Card>
    );
  }

  const hasMeals =
    suggestions &&
    (suggestions.canCookNow.length > 0 ||
      suggestions.nearlyThere.length > 0 ||
      suggestions.shoppingTrip.length > 0);

  if (!hasMeals) {
    return (
      <Card className="px-8 py-12 text-center">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No meals could be generated.
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void loadSuggestions()}
          className="mt-6"
        >
          Try again
        </Button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {successMessage && <SuccessBanner message={successMessage} />}

      <MealSection
        icon="🍳"
        title="Can Cook Now"
        meals={suggestions.canCookNow}
        onCooked={handleCooked}
      />
      <MealSection
        icon="🥘"
        title="Nearly There"
        meals={suggestions.nearlyThere}
        onCooked={handleCooked}
      />
      <MealSection
        icon="🛒"
        title="Shopping Trip"
        meals={suggestions.shoppingTrip}
        onCooked={handleCooked}
      />
    </div>
  );
}
