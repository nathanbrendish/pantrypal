"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, Clock } from "lucide-react";
import { saveMeal } from "@/app/actions/meals";
import { MissingIngredientsSection } from "@/components/missing-ingredients-section";
import { RecipeDetailModal } from "@/components/recipe-detail-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterBar, FilterSelect } from "@/components/ui/filter-bar";
import { ResponsiveGrid } from "@/components/ds/layout";
import { matchRecipeToPantry } from "@/lib/recipe-match";
import type { PantryForMatching } from "@/lib/recipe-match";
import type { Recipe, RecipeDifficulty } from "@/types/recipes";

type RecipeCatalogProps = {
  recipes: Recipe[];
  categories: string[];
  pantry: PantryForMatching[];
  initialRecipeId?: string | null;
  missingRecipeId?: string | null;
};

export function RecipeCatalog({
  recipes,
  categories,
  pantry,
  initialRecipeId = null,
  missingRecipeId = null,
}: RecipeCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState<RecipeDifficulty | "All">("All");
  const [maxPrepTime, setMaxPrepTime] = useState<number | "All">("All");
  const [selected, setSelected] = useState<Recipe | null>(() => {
    if (!initialRecipeId) {
      return null;
    }
    return recipes.find((recipe) => recipe.id === initialRecipeId) ?? null;
  });
  const [showMissingRecipe, setShowMissingRecipe] = useState(
    Boolean(missingRecipeId)
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!initialRecipeId) {
      return;
    }

    const recipe = recipes.find((item) => item.id === initialRecipeId) ?? null;
    setSelected(recipe);
  }, [initialRecipeId, recipes]);

  useEffect(() => {
    setShowMissingRecipe(Boolean(missingRecipeId));
  }, [missingRecipeId]);

  const clearDeepLink = () => {
    if (initialRecipeId || missingRecipeId) {
      router.replace(pathname, { scroll: false });
    }
  };

  const closeSelected = () => {
    setSelected(null);
    clearDeepLink();
  };

  const dismissMissingRecipe = () => {
    setShowMissingRecipe(false);
    clearDeepLink();
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return recipes.filter((recipe) => {
      if (q) {
        const haystack = `${recipe.name} ${recipe.description} ${recipe.ingredients.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (category !== "All" && recipe.category !== category) return false;
      if (difficulty !== "All" && recipe.difficulty !== difficulty) return false;
      if (maxPrepTime !== "All" && recipe.prep_time > maxPrepTime) return false;
      return true;
    });
  }, [recipes, search, category, difficulty, maxPrepTime]);

  const handleSave = async (recipe: Recipe) => {
    setSavingId(recipe.id);
    const match = matchRecipeToPantry(recipe, pantry);

    const result = await saveMeal({
      name: recipe.name,
      description: recipe.description,
      ingredientsUsed: match.ingredientsUsed,
      missingIngredients: match.missingIngredients,
    });

    if (result.success) {
      setSavedIds((prev) => new Set(prev).add(recipe.id));
    }
    setSavingId(null);
  };

  return (
    <div className="flex flex-col gap-8">
      {showMissingRecipe && (
        <p
          role="alert"
          className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
        >
          We couldn&apos;t find that recipe. It may have been removed. Browse
          the catalogue below, or{" "}
          <button
            type="button"
            onClick={dismissMissingRecipe}
            className="font-medium underline underline-offset-2"
          >
            dismiss this message
          </button>
          .
        </p>
      )}

      <FilterBar>
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
            placeholder="Search recipes…"
            className="sm:col-span-2"
            aria-label="Search recipes"
          />
          <FilterSelect
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="All">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value as RecipeDifficulty | "All")
            }
            aria-label="Filter by difficulty"
          >
            <option value="All">All difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </FilterSelect>
          <FilterSelect
            value={String(maxPrepTime)}
            onChange={(e) =>
              setMaxPrepTime(
                e.target.value === "All" ? "All" : Number(e.target.value)
              )
            }
            aria-label="Filter by prep time"
            className="lg:col-span-1 sm:col-span-2"
          >
            <option value="All">Any prep time</option>
            <option value="20">Under 20 min</option>
            <option value="30">Under 30 min</option>
            <option value="45">Under 45 min</option>
            <option value="60">Under 60 min</option>
          </FilterSelect>
      </FilterBar>
      <p className="text-sm text-muted">
          {filtered.length} recipe{filtered.length === 1 ? "" : "s"} found
        </p>

      <ResponsiveGrid variant="cards">
        {filtered.map((recipe) => {
          const match = matchRecipeToPantry(recipe, pantry);
          const isReady = match.missingIngredients.length === 0;

          return (
            <div key={recipe.id} className="pp-slide-up">
              <Card className="flex h-full flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    {recipe.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => void handleSave(recipe)}
                    disabled={savingId === recipe.id || savedIds.has(recipe.id)}
                    className="pp-focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40 disabled:opacity-60"
                    aria-label={
                      savedIds.has(recipe.id) ? "Saved" : "Save recipe"
                    }
                  >
                    <Bookmark
                      className={
                        savedIds.has(recipe.id)
                          ? "h-5 w-5 fill-rose-500 text-rose-500"
                          : "h-5 w-5"
                      }
                    />
                  </button>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                  {recipe.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {recipe.difficulty}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Clock className="h-3.5 w-3.5" />
                    {recipe.prep_time} min
                  </span>
                  <span
                    className={
                      isReady
                        ? "rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success-foreground"
                        : "rounded-full bg-expiring-soft px-2.5 py-1 text-xs font-semibold text-expiring"
                    }
                  >
                    {isReady
                      ? "Ready to cook"
                      : `${match.missingIngredients.length} missing`}
                  </span>
                </div>
                {match.missingIngredients.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {match.missingIngredients.slice(0, 4).map((ing) => (
                      <span
                        key={ing}
                        className="rounded-full bg-expiring-soft px-2.5 py-1 text-xs font-medium text-expiring"
                      >
                        {ing}
                      </span>
                    ))}
                    {match.missingIngredients.length > 4 && (
                      <span className="text-xs text-muted">
                        +{match.missingIngredients.length - 4} more
                      </span>
                    )}
                  </div>
                )}
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setSelected(recipe)}
                    className="flex-1"
                  >
                    View
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void handleSave(recipe)}
                    disabled={savingId === recipe.id || savedIds.has(recipe.id)}
                    className="flex-1 gap-2"
                  >
                    <Bookmark className="h-4 w-4" />
                    {savedIds.has(recipe.id)
                      ? "Saved"
                      : savingId === recipe.id
                        ? "Saving…"
                        : "Save"}
                  </Button>
                </div>
                {match.missingIngredients.length > 0 && (
                  <div className="mt-4">
                    <MissingIngredientsSection
                      ingredients={match.missingIngredients}
                      buttonSize="sm"
                      buttonVariant="outline"
                    />
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </ResponsiveGrid>

      {selected && (
        <RecipeDetailModal
          recipe={selected}
          pantry={pantry}
          onClose={closeSelected}
          initiallySaved={savedIds.has(selected.id)}
        />
      )}
    </div>
  );
}
