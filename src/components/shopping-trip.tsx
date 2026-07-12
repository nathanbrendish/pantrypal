"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Printer,
  Trash2,
} from "lucide-react";
import type { ShoppingListResult } from "@/app/actions/shopping";
import {
  clearCheckedItems,
  clearShoppingList,
  toggleShoppingItem,
} from "@/app/actions/shopping";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IconTile } from "@/components/ui/icon-tile";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SearchBar } from "@/components/ui/search-bar";
import { getCategoryIcon, type PantryCategory } from "@/lib/pantry-categories";
import { formatQuantity } from "@/lib/shopping-utils";
import { cn } from "@/lib/cn";
import { SHOPPING_CATEGORIES, type ShoppingListItem } from "@/types/v2";

type ShoppingTripProps = {
  initialData: ShoppingListResult;
};

function quantityLabel(item: ShoppingListItem): string | null {
  const formatted = item.unit
    ? formatQuantity(item.quantity, item.unit)
    : item.quantity === null
      ? ""
      : `x${item.quantity}`;
  return formatted ? `Buy ${formatted}` : "Buy";
}

function demandDetailLabel(
  label: string,
  quantity: number | null,
  unit: string | null
): string {
  const formatted = unit
    ? formatQuantity(quantity, unit)
    : quantity === null
      ? ""
      : `x${quantity}`;
  return `${label} ${formatted || "0"}`;
}

const SHOPPING_ICONS: Record<string, string> = {
  Produce: "🥬",
  Meat: "🥩",
  Dairy: "🧀",
  Bakery: "🍞",
  Frozen: "🧊",
  Cupboard: "🥫",
  "Herbs & Spices": "🌿",
  Drinks: "🥤",
  Unclassified: "📦",
};

function categoryIcon(category: string): string {
  return (
    SHOPPING_ICONS[category] ??
    getCategoryIcon(category as PantryCategory) ??
    "🛒"
  );
}

export function ShoppingTrip({ initialData }: ShoppingTripProps) {
  const [items, setItems] = useState(initialData.items);
  const [summary, setSummary] = useState(initialData.summary);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [justChecked, setJustChecked] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      item.ingredient_name.toLowerCase().includes(q)
    );
  }, [items, search]);

  const checkedCount = items.filter((item) => item.checked).length;
  const allDone = items.length > 0 && checkedCount === items.length;

  const grouped = useMemo(() => {
    const categoryOrder = new Map(
      SHOPPING_CATEGORIES.map((category, index) => [category, index])
    );
    const categories = Array.from(
      new Set(filteredItems.map((item) => item.category))
    ).sort(
      (a, b) =>
        (categoryOrder.get(a as (typeof SHOPPING_CATEGORIES)[number]) ?? 999) -
          (categoryOrder.get(b as (typeof SHOPPING_CATEGORIES)[number]) ??
            999) || a.localeCompare(b)
    );

    return categories.map((category) => ({
      category,
      items: filteredItems.filter((item) => item.category === category),
    }));
  }, [filteredItems]);

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

    if (checked) {
      setJustChecked(id);
      window.setTimeout(() => setJustChecked(null), 400);
    }

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

  const handleClearShoppingList = async () => {
    const confirmed = window.confirm(
      "Clear your entire shopping list? This will not change your pantry or meal plan."
    );
    if (!confirmed) {
      return;
    }

    const result = await clearShoppingList();

    if (!result.success) {
      setError(result.error);
      return;
    }

    setItems([]);
    setSummary({
      totalItems: 0,
      totalCategories: 0,
      hasMealPlan: false,
      allIngredientsCovered: false,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-6 sm:p-7 print:hidden">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              {summary.allIngredientsCovered ? (
                <p className="text-base font-semibold text-foreground">
                  You already have everything for this week&apos;s meals.
                </p>
              ) : summary.hasMealPlan && summary.totalItems > 0 ? (
                <p className="text-base font-semibold text-foreground">
                  You need {summary.totalItems} ingredient
                  {summary.totalItems === 1 ? "" : "s"} for this week&apos;s
                  meals.
                </p>
              ) : !summary.hasMealPlan && summary.totalItems === 0 ? (
                <p className="text-base font-semibold text-foreground">
                  Create a weekly meal plan to see your shopping list.
                </p>
              ) : !summary.hasMealPlan ? (
                <p className="text-base font-semibold text-foreground">
                  You have {summary.totalItems} item
                  {summary.totalItems === 1 ? "" : "s"} on your shopping list.
                </p>
              ) : (
                <p className="text-base font-semibold text-foreground">
                  Your shopping list is up to date.
                </p>
              )}

              {summary.hasMealPlan && (
                <p className="mt-2 text-sm text-muted">
                  {summary.totalItems} item
                  {summary.totalItems === 1 ? "" : "s"} across{" "}
                  {summary.totalCategories} categor
                  {summary.totalCategories === 1 ? "y" : "ies"}.
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
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => void handleClearShoppingList()}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Clear list
                </Button>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <ProgressBar
              label="Shopping progress"
              value={checkedCount}
              max={items.length}
            />
          )}
        </div>
      </Card>

      {allDone && (
        <Card className="pp-scale-in border-emerald-100 bg-emerald-50 p-8 text-center dark:border-emerald-900/40 dark:bg-emerald-950/30">
          <p className="text-4xl" aria-hidden="true">
            🎉
          </p>
          <p className="mt-3 text-lg font-semibold text-emerald-800 dark:text-emerald-300">
            Shopping complete!
          </p>
          <p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-400/80">
            Everything on your list is checked off.
          </p>
        </Card>
      )}

      {items.length > 0 && (
        <SearchBar
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onClear={() => setSearch("")}
          placeholder="Search shopping list…"
          sticky
          aria-label="Search shopping list"
        />
      )}

      {error && (
        <p className="rounded-[16px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 print:hidden dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
          {error}
        </p>
      )}

      {grouped.length > 0 ? (
        <div className="shopping-print-area flex flex-col gap-7">
          <h2 className="hidden text-2xl font-bold print:block">
            ShelfLife Shopping List
          </h2>

          {grouped.map(({ category, items: categoryItems }) => {
            const isCollapsed = collapsed[category] ?? false;

            return (
              <section key={category}>
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="flex w-full items-center gap-3 text-left print:pointer-events-none"
                  aria-expanded={!isCollapsed}
                >
                  <IconTile tone="slate" size="sm">
                    {categoryIcon(category)}
                  </IconTile>
                  <h3 className="text-lg font-semibold text-foreground">
                    {category}
                    <span className="ml-2 text-sm font-normal text-muted">
                      ({categoryItems.length})
                    </span>
                  </h3>
                  <span className="ml-auto print:hidden">
                    {isCollapsed ? (
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </span>
                </button>

                <div
                  className="pp-collapse mt-3"
                  data-open={!isCollapsed}
                >
                  <ul className="flex flex-col gap-2">
                    {categoryItems.map((item) => {
                      const qty = quantityLabel(item);
                      const isExpanded = expanded[item.id] ?? false;

                      return (
                        <li key={item.id}>
                          <Card
                            className={cn(
                              "px-4 py-3 print:border-0 print:shadow-none",
                              item.checked && "bg-background"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  void handleToggle(item.id, !item.checked)
                                }
                                className={cn(
                                  "pp-focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 transition-all print:hidden",
                                  item.checked
                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                    : "border-slate-300 bg-white hover:border-blue-400 dark:border-slate-600 dark:bg-transparent",
                                  justChecked === item.id && "pp-check-pop"
                                )}
                                aria-label={`Mark ${item.ingredient_name} as bought`}
                                aria-pressed={item.checked}
                              >
                                {item.checked && (
                                  <Check className="h-4 w-4" strokeWidth={3} />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setExpanded((current) => ({
                                    ...current,
                                    [item.id]: !current[item.id],
                                  }))
                                }
                                className="min-w-0 flex-1 text-left"
                                aria-expanded={isExpanded}
                              >
                                <p
                                  className={cn(
                                    "font-semibold transition-all",
                                    item.checked
                                      ? "pp-strike text-slate-400 line-through"
                                      : "text-foreground"
                                  )}
                                >
                                  {item.ingredient_name}
                                </p>
                                <p className="mt-0.5 text-sm font-medium text-muted">
                                  {qty}
                                </p>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setExpanded((current) => ({
                                    ...current,
                                    [item.id]: !current[item.id],
                                  }))
                                }
                                className="print:hidden"
                                aria-label={`${isExpanded ? "Collapse" : "Expand"} ${item.ingredient_name} details`}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-5 w-5 text-slate-400" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-slate-400" />
                                )}
                              </button>
                            </div>
                            {isExpanded && (
                              <div className="mt-3 rounded-xl bg-background px-3 py-2 text-sm text-muted">
                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                  <span>
                                    {demandDetailLabel(
                                      "Need",
                                      item.demand_quantity,
                                      item.demand_unit
                                    )}
                                  </span>
                                  <span>
                                    {demandDetailLabel(
                                      "Have",
                                      item.pantry_quantity,
                                      item.pantry_unit
                                    )}
                                  </span>
                                  <span>{qty}</span>
                                </div>
                                {item.used_by_meals.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs font-medium uppercase tracking-wide">
                                      Used by
                                    </p>
                                    <ul className="mt-1 list-disc space-y-0.5 pl-5">
                                      {item.used_by_meals.map((meal) => (
                                        <li key={meal}>{meal}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </Card>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </section>
            );
          })}
        </div>
      ) : summary.allIngredientsCovered ? (
        <EmptyState
          icon={<span className="text-4xl">🛒</span>}
          title="Shopping list empty."
          description="Looks like you're fully stocked for this week's meals."
          primaryAction={{ label: "Open pantry", href: "/pantry" }}
        />
      ) : !summary.hasMealPlan ? (
        <EmptyState
          icon={<span className="text-4xl">📅</span>}
          title="No shopping list yet."
          description="Your list updates automatically when you create a meal plan."
          primaryAction={{ label: "Open planner", href: "/planner" }}
        />
      ) : null}
    </div>
  );
}
