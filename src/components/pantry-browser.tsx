"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  List,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { deleteIngredient, updatePantryItem } from "@/app/actions/pantry";
import { PantryEditModal } from "@/components/pantry-edit-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { formatExpiryLabel, getExpiryStatus } from "@/lib/expiry";
import { getIngredientEmoji } from "@/lib/ingredient-emoji";
import {
  categorizeIngredient,
  PANTRY_CATEGORIES,
} from "@/lib/pantry-categories";
import { getExpiryClasses } from "@/lib/pantry-utils";
import { formatQuantity } from "@/lib/shopping-utils";
import { cn } from "@/lib/cn";
import type { PantryItem } from "@/types/pantry";

type PantryBrowserProps = {
  items: PantryItem[];
};

type ViewMode = "comfortable" | "compact";

const EXPIRING_STATUSES = new Set([
  "expired",
  "today",
  "tomorrow",
  "soon",
]);

function expiryTextClass(status: ReturnType<typeof getExpiryStatus>) {
  switch (status) {
    case "expired":
      return "text-red-700 dark:text-red-400";
    case "today":
      return "text-amber-700 dark:text-amber-400";
    case "tomorrow":
      return "text-yellow-700 dark:text-yellow-400";
    case "soon":
      return "text-orange-700 dark:text-orange-400";
    default:
      return "text-zinc-500 dark:text-zinc-400";
  }
}

export function PantryBrowser({ items }: PantryBrowserProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("comfortable");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        event.preventDefault();
        document.getElementById("pantry-search")?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      item.ingredient_name.toLowerCase().includes(q)
    );
  }, [items, search]);

  const expiringSoon = useMemo(
    () =>
      filtered.filter((item) =>
        EXPIRING_STATUSES.has(getExpiryStatus(item.expiry_date))
      ),
    [filtered]
  );

  const byCategory = useMemo(() => {
    const groups = new Map<string, PantryItem[]>();

    for (const cat of PANTRY_CATEGORIES) {
      groups.set(cat, []);
    }

    for (const item of filtered) {
      const cat = categorizeIngredient(item.ingredient_name);
      groups.get(cat)?.push(item);
    }

    return PANTRY_CATEGORIES.map((category) => ({
      category,
      items: groups.get(category) ?? [],
    })).filter((g) => g.items.length > 0);
  }, [filtered]);

  const handleSave = async (
    id: string,
    data: {
      ingredient_name: string;
      quantity: number;
      unit: string | null;
      expiry_date: string | null;
    }
  ) => {
    const result = await updatePantryItem(id, data);
    if (result.success) {
      router.refresh();
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const renderItem = (item: PantryItem) => {
    const status = getExpiryStatus(item.expiry_date);
    const qty = formatQuantity(item.quantity, item.unit);
    const isCompact = viewMode === "compact";

    return (
      <li key={item.id}>
        <Card
          className={cn(
            "flex items-center gap-3 border",
            isCompact ? "p-3" : "gap-5 p-5",
            getExpiryClasses(status)
          )}
        >
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800",
              isCompact ? "h-10 w-10 text-2xl" : "h-14 w-14 text-3xl"
            )}
            aria-hidden="true"
          >
            {getIngredientEmoji(item.ingredient_name)}
          </span>

          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate font-semibold text-zinc-900 dark:text-zinc-100",
                isCompact ? "text-sm" : "text-base"
              )}
            >
              {item.ingredient_name}
            </p>
            <div className="mt-0.5 flex flex-wrap gap-x-3 text-sm">
              {qty && (
                <span className="text-zinc-600 dark:text-zinc-300">{qty}</span>
              )}
              <span className={expiryTextClass(status)}>
                {formatExpiryLabel(item.expiry_date)}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditingItem(item)}
              className={cn("px-3", isCompact ? "h-10" : "h-11")}
              aria-label={`Edit ${item.ingredient_name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <form action={deleteIngredient}>
              <input type="hidden" name="id" value={item.id} />
              <Button
                type="submit"
                variant="danger"
                className={cn("px-3", isCompact ? "h-10" : "h-11")}
                aria-label={`Remove ${item.ingredient_name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </li>
    );
  };

  const renderSection = (
    title: string,
    sectionItems: PantryItem[],
    key: string
  ) => {
    const isCollapsed = collapsed[key] ?? false;

    return (
      <section key={key}>
        <button
          type="button"
          onClick={() =>
            setCollapsed((c) => ({ ...c, [key]: !c[key] }))
          }
          className="sticky top-[72px] z-10 flex w-full items-center gap-2 rounded-lg bg-slate-50/95 py-3 text-left backdrop-blur-sm dark:bg-zinc-950/95"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-zinc-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-zinc-400" />
          )}
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
            <span className="ml-2 text-sm font-normal text-zinc-500">
              ({sectionItems.length})
            </span>
          </h3>
        </button>

        {!isCollapsed && (
          <ul
            className={cn(
              "flex flex-col",
              viewMode === "compact" ? "gap-2" : "gap-3"
            )}
          >
            {sectionItems.map(renderItem)}
          </ul>
        )}
      </section>
    );
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<span className="text-4xl">🥫</span>}
        title="Your pantry is empty."
        description="Add ingredients manually or scan your first shopping receipt."
        primaryAction={{ label: "Add Ingredient", href: "#add-ingredient" }}
        secondaryAction={{ label: "Scan Receipt", href: "/receipt-scanner" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-0 z-20 -mx-1 rounded-xl border border-zinc-200 bg-white/95 p-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="pantry-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ingredients… (press /)"
              className="h-12 pl-10"
              aria-label="Search pantry ingredients"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={viewMode === "comfortable" ? "primary" : "secondary"}
              onClick={() => setViewMode("comfortable")}
              className="h-12 gap-2"
              aria-label="Comfortable view"
            >
              <LayoutGrid className="h-4 w-4" />
              Comfortable
            </Button>
            <Button
              type="button"
              variant={viewMode === "compact" ? "primary" : "secondary"}
              onClick={() => setViewMode("compact")}
              className="h-12 gap-2"
              aria-label="Compact view"
            >
              <List className="h-4 w-4" />
              Compact
            </Button>
          </div>
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {filtered.length} of {items.length} ingredients
        </p>
      </div>

      {filtered.length === 0 ? (
        <Card className="px-8 py-12 text-center">
          <p className="text-sm text-zinc-500">No ingredients match your search.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {expiringSoon.length > 0 &&
            renderSection("Expiring Soon", expiringSoon, "expiring-soon")}
          {byCategory.map(({ category, items: catItems }) =>
            renderSection(category, catItems, category)
          )}
        </div>
      )}

      <PantryEditModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSave}
      />
    </div>
  );
}
