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
import { clearCheckedItems, toggleShoppingItem } from "@/app/actions/shopping";
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
  if (item.shortage_label) {
    return item.shortage_label;
  }

  const formatted = formatQuantity(item.quantity, item.unit);
  return formatted || null;
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
  const [summary] = useState(initialData.summary);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [justChecked, setJustChecked] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      item.ingredient_name.toLowerCase().includes(q)
    );
  }, [items, search]);

  const checkedCount = items.filter((item) => item.checked).length;
  const allDone = items.length > 0 && checkedCount === items.length;

  const grouped = SHOPPING_CATEGORIES.map((category) => ({
    category,
    items: filteredItems.filter((item) => item.category === category),
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
                  <ul className="flex flex-col gap-2.5">
                    {categoryItems.map((item) => {
                      const qty = quantityLabel(item);

                      return (
                        <li key={item.id}>
                          <Card
                            className={cn(
                              "flex items-center gap-4 px-4 py-4 print:border-0 print:shadow-none",
                              item.checked && "bg-background"
                            )}
                          >
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
                            <div className="min-w-0 flex-1">
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
                              <div className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-muted">
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
