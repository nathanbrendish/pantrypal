"use client";

import { useRef, useState } from "react";
import { GripVertical, Loader2, RefreshCw } from "lucide-react";
import {
  generateMealPlan,
  reorderMealPlanItems,
  replaceMealPlanItem,
} from "@/app/actions/planner";
import { MissingIngredientsSection } from "@/components/missing-ingredients-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/skeleton";
import type { MealPlanItem } from "@/types/v2";

type MealPlannerProps = {
  initialItems: MealPlanItem[];
  initialDaysCount: number;
};

export function MealPlanner({
  initialItems,
  initialDaysCount,
}: MealPlannerProps) {
  const [items, setItems] = useState(initialItems);
  const [daysCount, setDaysCount] = useState<3 | 5 | 7>(
    (initialDaysCount as 3 | 5 | 7) || 7
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isGeneratingRef = useRef(false);

  const handleGenerate = async () => {
    if (isGeneratingRef.current) {
      return;
    }

    isGeneratingRef.current = true;
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateMealPlan(daysCount);

      if (!result.success) {
        setError(result.error);
        return;
      }

      window.location.reload();
    } catch {
      setError("Unable to generate your meal plan. Please try again.");
    } finally {
      isGeneratingRef.current = false;
      setIsGenerating(false);
    }
  };

  const handleReplace = async (itemId: string) => {
    setReplacingId(itemId);
    setError(null);

    const result = await replaceMealPlanItem(itemId);

    if (!result.success) {
      setError(result.error);
      setReplacingId(null);
      return;
    }

    window.location.reload();
  };

  const handleDrop = async (targetId: string) => {
    if (!draggingId || draggingId === targetId) {
      return;
    }

    const current = [...items];
    const fromIndex = current.findIndex((item) => item.id === draggingId);
    const toIndex = current.findIndex((item) => item.id === targetId);

    if (fromIndex < 0 || toIndex < 0) {
      return;
    }

    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);

    const reordered = current.map((item, index) => ({
      ...item,
      sort_order: index,
    }));

    setItems(reordered);
    setDraggingId(null);

    const result = await reorderMealPlanItems(reordered.map((item) => item.id));

    if (!result.success) {
      setError(result.error);
      setItems(items);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-6 sm:p-7">
        <h2 className="text-lg font-semibold text-foreground">
          Generate meal plan
        </h2>
        <p className="mt-2 text-sm text-muted">
          AI prioritises pantry ingredients, reduces waste, and avoids duplicate
          meals.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {([3, 5, 7] as const).map((days) => (
            <Button
              key={days}
              type="button"
              variant={daysCount === days ? "primary" : "secondary"}
              onClick={() => setDaysCount(days)}
              disabled={isGenerating}
            >
              {days} days
            </Button>
          ))}
          <Button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={isGenerating}
            className="ml-auto gap-2"
            size="lg"
          >
            {isGenerating && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {isGenerating ? "Generating…" : "Generate Plan"}
          </Button>
        </div>
      </Card>

      {isGenerating && <ListSkeleton rows={3} />}

      {error && (
        <p
          role="alert"
          className="rounded-[16px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400"
        >
          {error}
        </p>
      )}

      {items.length > 0 ? (
        <div className="relative flex flex-col gap-0">
          <div
            className="absolute bottom-4 left-6 top-4 w-0.5 bg-gradient-to-b from-blue-200 via-blue-300 to-transparent dark:from-blue-900 dark:via-blue-800"
            aria-hidden="true"
          />
          <ul className="flex flex-col gap-5">
            {items.map((item, index) => {
              const missing = item.missing_ingredients.length;
              const used = item.ingredients_used?.length ?? 0;
              const total = used + missing;
              const match =
                total > 0 ? Math.round((used / total) * 100) : missing === 0 ? 100 : 0;

              return (
                <li
                  key={item.id}
                  draggable
                  onDragStart={() => setDraggingId(item.id)}
                  onDragEnd={() => setDraggingId(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => void handleDrop(item.id)}
                  className="pp-slide-up relative pl-14"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="absolute left-3 top-7 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-md ring-4 ring-background">
                    {item.day_index + 1}
                  </span>
                  <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:gap-5 sm:p-6">
                    <button
                      type="button"
                      className="mt-0.5 hidden h-10 w-10 shrink-0 cursor-grab items-center justify-center rounded-xl text-muted transition-colors hover:bg-background hover:text-foreground sm:flex "
                      aria-label="Drag to reorder"
                    >
                      <GripVertical className="h-5 w-5" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="default">Day {item.day_index + 1}</Badge>
                        <Badge variant={match === 100 ? "success" : "orange"}>
                          {match}% match
                        </Badge>
                      </div>
                      <h3 className="mt-2 text-xl font-bold tracking-tight text-foreground">
                        {item.meal_name}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {item.description}
                      </p>
                      {missing > 0 && (
                        <div className="mt-4">
                          <MissingIngredientsSection
                            ingredients={item.missing_ingredients}
                            buttonSize="sm"
                            buttonVariant="outline"
                          />
                        </div>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => void handleReplace(item.id)}
                      disabled={replacingId === item.id || isGenerating}
                      className="h-11 shrink-0 gap-2 self-start"
                    >
                      <RefreshCw className="h-4 w-4" aria-hidden="true" />
                      {replacingId === item.id ? "Replacing…" : "Replace"}
                    </Button>
                  </Card>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        !isGenerating && (
          <EmptyState
            icon={<span className="text-4xl">📅</span>}
            title="No meal plan yet."
            description="Choose the number of days and generate your first plan."
          />
        )
      )}
    </div>
  );
}
