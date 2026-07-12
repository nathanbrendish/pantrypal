"use client";

import { useCallback, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import {
  getCatalogueMealSuggestions,
  suggestMeals,
} from "@/app/actions/meals";
import { MealSection } from "@/components/meal-section";
import { RecipeDetailModal } from "@/components/recipe-detail-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SuccessBanner } from "@/components/ui/success-banner";
import { getRecipeById } from "@/lib/recipes";
import type { PantryForMatching } from "@/lib/recipe-match";
import type { Meal, MealSuggestions } from "@/types/meals";

type MealsSuggestionsProps = {
  hasIngredients: boolean;
  initialSuggestions: MealSuggestions | null;
  pantry: PantryForMatching[];
};

function hasMeals(suggestions: MealSuggestions | null): boolean {
  if (!suggestions) {
    return false;
  }

  return (
    suggestions.canCookNow.length > 0 ||
    suggestions.nearlyThere.length > 0 ||
    suggestions.shoppingTrip.length > 0
  );
}

export function MealsSuggestions({
  hasIngredients,
  initialSuggestions,
  pantry,
}: MealsSuggestionsProps) {
  const [catalogueSuggestions, setCatalogueSuggestions] =
    useState<MealSuggestions | null>(initialSuggestions);
  const [aiSuggestions, setAiSuggestions] = useState<MealSuggestions | null>(
    null
  );
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const selectedRecipe = selectedRecipeId
    ? getRecipeById(selectedRecipeId)
    : undefined;

  const refreshCatalogue = useCallback(async () => {
    setIsRefreshing(true);
    const result = await getCatalogueMealSuggestions();

    if (result.status === "success") {
      setCatalogueSuggestions(result.suggestions);
    }

    setIsRefreshing(false);
  }, []);

  const handleCooked = () => {
    setSuccessMessage("Enjoy your meal!");
    setSelectedRecipeId(null);
    void refreshCatalogue();
  };

  const handleOpenRecipe = (meal: Meal) => {
    if (meal.recipeId) {
      setSelectedRecipeId(meal.recipeId);
    }
  };

  const handleGenerateMore = async () => {
    setIsLoadingAi(true);
    setError(null);

    const result = await suggestMeals();

    if (result.status === "empty") {
      setError("Add ingredients to your pantry to generate more ideas.");
      setIsLoadingAi(false);
      return;
    }

    if (result.status === "error") {
      setError(result.message);
      setIsLoadingAi(false);
      return;
    }

    if (!hasMeals(result.suggestions)) {
      setError(
        "We couldn't invent enough unique recipes right now. Try again later."
      );
      setIsLoadingAi(false);
      return;
    }

    setAiSuggestions(result.suggestions);
    setIsLoadingAi(false);
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

  if (!hasMeals(catalogueSuggestions) && !isRefreshing) {
    return (
      <Card className="px-8 py-12 text-center">
        <p className="text-sm text-foreground">
          No matching recipes found for your pantry yet.
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void refreshCatalogue()}
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

      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">
            Need more inspiration?
          </h2>
          <p className="mt-1 text-sm text-muted">
            Ask AI for extra recipe ideas that aren&apos;t already in the
            ShelfLife catalogue.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => void handleGenerateMore()}
          disabled={isLoadingAi}
          className="shrink-0 gap-2"
        >
          {isLoadingAi ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate More Ideas
            </>
          )}
        </Button>
      </Card>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400"
        >
          {error}
        </p>
      )}

      {catalogueSuggestions && (
        <div className="flex flex-col gap-10">
          <MealSection
            icon="🍳"
            title="Can Cook Now"
            meals={catalogueSuggestions.canCookNow}
            onCooked={handleCooked}
            onOpenRecipe={handleOpenRecipe}
          />
          <MealSection
            icon="🥘"
            title="Nearly There"
            meals={catalogueSuggestions.nearlyThere}
            onCooked={handleCooked}
            onOpenRecipe={handleOpenRecipe}
          />
          <MealSection
            icon="🛒"
            title="Shopping Trip"
            meals={catalogueSuggestions.shoppingTrip}
            onCooked={handleCooked}
            onOpenRecipe={handleOpenRecipe}
          />
        </div>
      )}

      {aiSuggestions && hasMeals(aiSuggestions) && (
        <div className="flex flex-col gap-10 border-t border-border pt-10">
          <h2 className="text-lg font-semibold text-foreground">
            AI ideas just for you
          </h2>
          <MealSection
            icon="✨"
            title="AI — Can Cook Now"
            meals={aiSuggestions.canCookNow}
            onCooked={handleCooked}
          />
          <MealSection
            icon="✨"
            title="AI — Nearly There"
            meals={aiSuggestions.nearlyThere}
            onCooked={handleCooked}
          />
          <MealSection
            icon="✨"
            title="AI — Shopping Trip"
            meals={aiSuggestions.shoppingTrip}
            onCooked={handleCooked}
          />
        </div>
      )}

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          pantry={pantry}
          onClose={() => setSelectedRecipeId(null)}
          onCooked={handleCooked}
        />
      )}
    </div>
  );
}
