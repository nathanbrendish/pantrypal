"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Download, Printer, Trash2 } from "lucide-react";
import type { ShoppingListResult } from "@/app/actions/shopping";
import { clearCheckedItems, toggleShoppingItem } from "@/app/actions/shopping";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SHOPPING_CATEGORIES, type ShoppingListItem } from "@/types/v2";
import { formatQuantity } from "@/lib/shopping-utils";
import { cn } from "@/lib/cn";

type ShoppingTripProps = {
  initialData: ShoppingListResult;
};

function quantityLabel(item: ShoppingListItem): string | null {
  if (item.shortage_label) {
    return item.shortage_label;
  }

  const formatted = formatQuantity(item.quantity, item.unit);
  return formatted || null;
}

export function ShoppingTrip({ initialData }: ShoppingTripProps) {
  const [items, setItems] = useState(initialData.items);
  const [summary] = useState(initialData.summary);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const grouped = SHOPPING_CATEGORIES.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  const toggleCategory = (category: string) => {
    setCollapsed((current) => ({
      ...current,
      [category]: !current[category],
    }));
  };

  const handleToggle = async (id: string, checked: boolean) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, checked } : item))
    );

    const result = await toggleShoppingItem(id, checked);
    if (!result.success) {
      setError(result.error);
      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, checked: !checked } : item
        )
      );
    }
  };

  const handleClearChecked = async () => {
    const result = await clearCheckedItems();

    if (!result.success) {
      setError(result.error);
      return;
    }

    setItems((current) => current.filter((item) => !item.checked));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-6 print:hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {summary.allIngredientsCovered ? (
              <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                🎉 You already have everything you need for this week&apos;s
                meals.
              </p>
            ) : summary.hasMealPlan && summary.totalItems > 0 ? (
              <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                You need {summary.totalItems} ingredient
                {summary.totalItems === 1 ? "" : "s"} for this week&apos;s
                meals.
              </p>
            ) : !summary.hasMealPlan ? (
              <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                Create a weekly meal plan to see your shopping list.
              </p>
            ) : (
              <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                Your shopping list is up to date.
              </p>
            )}

            {summary.hasMealPlan && (
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {summary.totalItems} item{summary.totalItems === 1 ? "" : "s"}{" "}
                across {summary.totalCategories} categor
                {summary.totalCategories === 1 ? "y" : "ies"} — calculated from
                your meal plan and pantry.
              </p>
            )}
          </div>

          {items.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={handlePrint}>
                <Printer className="h-4 w-4" aria-hidden="true" />
                Print
              </Button>
              <Button type="button" variant="secondary" onClick={handlePrint}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Export PDF
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void handleClearChecked()}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Clear checked
              </Button>
            </div>
          )}
        </div>
      </Card>

      {error && (
        <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 print:hidden dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </p>
      )}

      {grouped.length > 0 ? (
        <div className="shopping-print-area flex flex-col gap-6">
          <h2 className="hidden text-2xl font-bold print:block">
            PantryPal Shopping List
          </h2>

          {grouped.map(({ category, items: categoryItems }) => {
            const isCollapsed = collapsed[category] ?? false;

            return (
              <section key={category}>
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="flex w-full items-center gap-2 text-left print:pointer-events-none"
                  aria-expanded={!isCollapsed}
                >
                  <span className="print:hidden">
                    {isCollapsed ? (
                      <ChevronRight className="h-5 w-5 text-zinc-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-zinc-400" />
                    )}
                  </span>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {category}
                    <span className="ml-2 text-sm font-normal text-zinc-500 dark:text-zinc-400">
                      ({categoryItems.length})
                    </span>
                  </h3>
                </button>

                {!isCollapsed && (
                  <ul className="mt-3 flex flex-col gap-2">
                    {categoryItems.map((item) => {
                      const qty = quantityLabel(item);

                      return (
                        <li key={item.id}>
                          <Card className="flex items-center gap-3 p-4 print:border-0 print:shadow-none">
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={(event) =>
                                void handleToggle(
                                  item.id,
                                  event.target.checked
                                )
                              }
                              className="h-5 w-5 rounded border-zinc-300 text-blue-600 print:hidden"
                              aria-label={`Mark ${item.ingredient_name} as bought`}
                            />
                            <div className="min-w-0 flex-1">
                              <p
                                className={cn(
                                  "font-medium",
                                  item.checked
                                    ? "text-zinc-400 line-through dark:text-zinc-500"
                                    : "text-zinc-900 dark:text-zinc-100"
                                )}
                              >
                                {item.ingredient_name}
                              </p>
                              <div className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-zinc-500 dark:text-zinc-400">
                                {qty && <span>{qty}</span>}
                                <span>
                                  Needed for {item.needed_for_meals} meal
                                  {item.needed_for_meals === 1 ? "" : "s"}
                                </span>
                              </div>
                            </div>
                          </Card>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      ) : summary.allIngredientsCovered ? (
        <Card className="px-8 py-12 text-center">
          <p className="text-4xl" role="img" aria-hidden="true">
            🎉
          </p>
          <p className="mt-4 text-base font-medium text-zinc-900 dark:text-zinc-100">
            You already have everything you need for this week&apos;s meals.
          </p>
        </Card>
      ) : !summary.hasMealPlan ? (
        <Card className="px-8 py-12 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Your shopping list updates automatically when you create a meal
            plan. Head to the planner to get started.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
