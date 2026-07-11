"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { suggestMeals } from "@/app/actions/meals";
import { MealSection } from "@/components/meal-section";
import { MealSkeleton } from "@/components/meal-skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      <Card className="flex flex-col items-center px-8 py-16 text-center">
        <span className="text-5xl" role="img" aria-hidden="true">
          🥫
        </span>
        <h2 className="mt-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          You don&apos;t have any ingredients yet.
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Your pantry is empty. Add ingredients before requesting meal
          suggestions.
        </p>
        <Link href="/pantry" className="mt-8">
          <Button className="h-12 px-8">Go to Pantry</Button>
        </Link>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <div className="h-7 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <MealSkeleton key={index} />
            ))}
          </div>
        </section>
      </div>
    );
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
