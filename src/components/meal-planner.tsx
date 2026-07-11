"use client";

import { useState } from "react";
import { GripVertical, RefreshCw } from "lucide-react";
import {
  generateMealPlan,
  reorderMealPlanItems,
  replaceMealPlanItem,
} from "@/app/actions/planner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    const result = await generateMealPlan(daysCount);

    if (!result.success) {
      setError(result.error);
      setIsGenerating(false);
      return;
    }

    window.location.reload();
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
      day_index: index,
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
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Generate meal plan
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
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
            >
              {days} days
            </Button>
          ))}
          <Button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={isGenerating}
            className="ml-auto"
          >
            {isGenerating ? "Generating…" : "Generate Plan"}
          </Button>
        </div>
      </Card>

      {error && (
        <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </p>
      )}

      {items.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {items.map((item, index) => (
            <li
              key={item.id}
              draggable
              onDragStart={() => setDraggingId(item.id)}
              onDragEnd={() => setDraggingId(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => void handleDrop(item.id)}
            >
              <Card className="flex gap-4 p-5">
                <button
                  type="button"
                  className="mt-1 cursor-grab text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  aria-label="Drag to reorder"
                >
                  <GripVertical className="h-5 w-5" />
                </button>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
                    Day {index + 1}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {item.meal_name}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {item.description}
                  </p>
                  {item.missing_ingredients.length > 0 && (
                    <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">
                      Missing: {item.missing_ingredients.join(", ")}
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handleReplace(item.id)}
                  disabled={replacingId === item.id}
                  className="h-10 shrink-0 gap-2 self-start"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  {replacingId === item.id ? "Replacing…" : "Replace"}
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card className="px-8 py-12 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No meal plan yet. Choose the number of days and generate your first
            plan.
          </p>
        </Card>
      )}
    </div>
  );
}
