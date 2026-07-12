"use client";

import { useActionState, useState } from "react";
import {
  addIngredient,
  getCommunityFoodDefaults,
} from "@/app/actions/pantry";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { findCategoryName, suggestStorageLocationId } from "@/lib/storage-locations";
import type { FoodCategory, StorageLocation } from "@/types/taxonomy";

const SELECT_CLASS =
  "h-[var(--ds-height-control)] w-full rounded-[var(--ds-radius-md)] border border-border bg-card px-[var(--ds-space-lg)] text-sm text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

type AddIngredientFormProps = {
  storageLocations: StorageLocation[];
  categories: FoodCategory[];
};

export function AddIngredientForm({
  storageLocations,
  categories,
}: AddIngredientFormProps) {
  const [state, formAction, isPending] = useActionState(addIngredient, null);
  const [ingredientName, setIngredientName] = useState("");
  const [unit, setUnit] = useState("");
  const [storageLocationId, setStorageLocationId] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(false);

  const applyCommunityDefaults = async () => {
    if (!ingredientName.trim()) {
      return;
    }

    setIsLoadingDefaults(true);
    const defaults = await getCommunityFoodDefaults(ingredientName);
    setIsLoadingDefaults(false);

    if (!defaults) {
      return;
    }

    setUnit((current) => current || defaults.default_unit || "");
    setExpiryDate((current) => current || defaults.default_expiry_date || "");
    setStorageLocationId((current) => {
      if (current) {
        return current;
      }
      if (defaults.suggested_storage_location_id) {
        return defaults.suggested_storage_location_id;
      }
      const categoryName = findCategoryName(
        defaults.food_category_id,
        categories
      );
      return (
        suggestStorageLocationId(categoryName, storageLocations) ?? ""
      );
    });
  };

  return (
    <Card className="p-6 sm:p-8">
      <form action={formAction} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="ingredient_name"
            type="text"
            placeholder="Ingredient name"
            aria-label="Ingredient name"
            required
            value={ingredientName}
            onChange={(event) => setIngredientName(event.target.value)}
            onBlur={() => void applyCommunityDefaults()}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              name="quantity"
              type="number"
              min="0.01"
              step="any"
              defaultValue="1"
              placeholder="Qty"
              aria-label="Quantity"
            />
            <Input
              name="unit"
              type="text"
              placeholder="Unit"
              aria-label="Unit"
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            />
          </div>
          <select
            name="storage_location_id"
            aria-label="Storage location"
            className={SELECT_CLASS}
            value={storageLocationId}
            onChange={(event) => setStorageLocationId(event.target.value)}
          >
            <option value="">Storage location…</option>
            {storageLocations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.icon ? `${location.icon} ` : ""}
                {location.name}
              </option>
            ))}
          </select>
          <Input
            name="expiry_date"
            type="date"
            aria-label="Expiry date"
            value={expiryDate}
            onChange={(event) => setExpiryDate(event.target.value)}
          />
        </div>

        <Button type="submit" disabled={isPending} className="h-12 w-fit px-8">
          {isPending ? "Adding…" : "Add to Pantry"}
        </Button>
        {isLoadingDefaults && (
          <p className="text-sm text-muted">Checking community food knowledge…</p>
        )}
      </form>

      {state?.error && (
        <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
          {state.error}
        </p>
      )}
    </Card>
  );
}
