"use client";

import { useMemo, useState } from "react";
import { Bookmark, Clock, Search } from "lucide-react";
import { saveMeal } from "@/app/actions/meals";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { matchRecipeToPantry } from "@/lib/recipe-match";
import type { PantryForMatching } from "@/lib/recipe-match";
import type { Recipe, RecipeDifficulty } from "@/types/recipes";

type RecipeCatalogProps = {
  recipes: Recipe[];
  categories: string[];
  pantry: PantryForMatching[];
};

export function RecipeCatalog({
  recipes,
  categories,
  pantry,
}: RecipeCatalogProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState<RecipeDifficulty | "All">("All");
  const [maxPrepTime, setMaxPrepTime] = useState<number | "All">("All");
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

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
      <Card className="p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipes…"
              className="h-11 pl-10"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <option value="All">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value as RecipeDifficulty | "All")
            }
            className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <option value="All">All difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select
            value={String(maxPrepTime)}
            onChange={(e) =>
              setMaxPrepTime(
                e.target.value === "All" ? "All" : Number(e.target.value)
              )
            }
            className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <option value="All">Any prep time</option>
            <option value="20">Under 20 min</option>
            <option value="30">Under 30 min</option>
            <option value="45">Under 45 min</option>
            <option value="60">Under 60 min</option>
          </select>
        </div>
        <p className="mt-3 text-sm text-zinc-500">
          {filtered.length} recipe{filtered.length === 1 ? "" : "s"} found
        </p>
      </Card>

      <ul className="grid gap-4 sm:grid-cols-2">
        {filtered.map((recipe) => {
          const match = matchRecipeToPantry(recipe, pantry);

          return (
            <li key={recipe.id}>
              <Card className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {recipe.name}
                  </h3>
                  <span className="shrink-0 rounded-lg bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {recipe.difficulty}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
                  {recipe.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {recipe.prep_time} min
                  </span>
                  <span>{recipe.category}</span>
                  <span>
                    {match.missingIngredients.length === 0
                      ? "Ready to cook"
                      : `${match.missingIngredients.length} missing`}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setSelected(recipe)}
                  >
                    View
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void handleSave(recipe)}
                    disabled={savingId === recipe.id || savedIds.has(recipe.id)}
                    className="gap-2"
                  >
                    <Bookmark className="h-4 w-4" />
                    {savedIds.has(recipe.id)
                      ? "Saved"
                      : savingId === recipe.id
                        ? "Saving…"
                        : "Save For Later"}
                  </Button>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelected(null)}
          role="presentation"
        >
          <Card
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {selected.name}
            </h2>
            <p className="mt-2 text-sm text-zinc-500">{selected.description}</p>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
              {selected.difficulty} · {selected.prep_time} min · {selected.category}
            </p>
            <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Ingredients
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              {selected.ingredients.map((ing, i) => (
                <li key={ing}>
                  {selected.typical_quantities[i]
                    ? `${selected.typical_quantities[i]} `
                    : ""}
                  {ing}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setSelected(null)}>
                Close
              </Button>
              <Button
                type="button"
                onClick={() => void handleSave(selected)}
                disabled={savingId === selected.id || savedIds.has(selected.id)}
              >
                Save For Later
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
