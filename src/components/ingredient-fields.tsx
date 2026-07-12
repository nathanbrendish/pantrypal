"use client";

import { useState } from "react";
import { getCommunityFoodDefaults } from "@/app/actions/pantry";
import { Input } from "@/components/ui/input";
import {
  tierBadgeClasses,
  tierLabel,
  UNCLASSIFIED_LABEL,
} from "@/lib/food-classification";
import {
  findCategoryName,
  suggestStorageLocationId,
} from "@/lib/storage-locations";
import type {
  ClassificationTier,
  FoodCategory,
  StorageLocation,
} from "@/types/taxonomy";

const SELECT_CLASS =
  "h-[var(--ds-height-control)] w-full rounded-[var(--ds-radius-md)] border border-border bg-card px-[var(--ds-space-lg)] text-sm text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export type IngredientDraft = {
  ingredient_name: string;
  quantity: number;
  unit: string;
  storage_location_id: string;
  expiry_date: string;
};

export const EMPTY_INGREDIENT_DRAFT: IngredientDraft = {
  ingredient_name: "",
  quantity: 1,
  unit: "",
  storage_location_id: "",
  expiry_date: "",
};

type IngredientFieldsProps = {
  value: IngredientDraft;
  onChange: (patch: Partial<IngredientDraft>) => void;
  storageLocations: StorageLocation[];
  categories: FoodCategory[];
  /** Adds `name` attributes so a native <form> can submit the values. */
  withFormNames?: boolean;
  disabled?: boolean;
  requireName?: boolean;
};

/**
 * The single ingredient input group shared by manual add and receipt review.
 * Resolves the Food Knowledge Graph on name blur to silently prefill unit,
 * expiry, and a suggested storage location, and to show the community
 * classification. Storage location stays user-owned and is never overwritten
 * once set.
 */
export function IngredientFields({
  value,
  onChange,
  storageLocations,
  categories,
  withFormNames = false,
  disabled = false,
  requireName = false,
}: IngredientFieldsProps) {
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(false);
  const [classification, setClassification] = useState<{
    categoryName: string | null;
    tier: ClassificationTier;
  } | null>(null);

  const applyCommunityDefaults = async () => {
    const name = value.ingredient_name.trim();
    if (!name) {
      return;
    }

    setIsLoadingDefaults(true);
    const defaults = await getCommunityFoodDefaults(name);
    setIsLoadingDefaults(false);

    if (!defaults) {
      setClassification(null);
      return;
    }

    const patch: Partial<IngredientDraft> = {};
    if (!value.unit && defaults.default_unit) {
      patch.unit = defaults.default_unit;
    }
    if (!value.expiry_date && defaults.default_expiry_date) {
      patch.expiry_date = defaults.default_expiry_date;
    }
    if (!value.storage_location_id) {
      const suggested =
        defaults.suggested_storage_location_id ??
        suggestStorageLocationId(
          findCategoryName(defaults.food_category_id, categories),
          storageLocations
        );
      if (suggested) {
        patch.storage_location_id = suggested;
      }
    }

    if (Object.keys(patch).length > 0) {
      onChange(patch);
    }

    setClassification({
      categoryName: findCategoryName(defaults.food_category_id, categories),
      tier: defaults.tier,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          name={withFormNames ? "ingredient_name" : undefined}
          type="text"
          placeholder="Ingredient name"
          aria-label="Ingredient name"
          required={requireName}
          disabled={disabled}
          value={value.ingredient_name}
          onChange={(event) => onChange({ ingredient_name: event.target.value })}
          onBlur={() => void applyCommunityDefaults()}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            name={withFormNames ? "quantity" : undefined}
            type="number"
            min="0.01"
            step="any"
            placeholder="Qty"
            aria-label="Quantity"
            disabled={disabled}
            value={value.quantity}
            onChange={(event) =>
              onChange({
                quantity: Number.parseFloat(event.target.value) || 1,
              })
            }
          />
          <Input
            name={withFormNames ? "unit" : undefined}
            type="text"
            placeholder="Unit"
            aria-label="Unit"
            disabled={disabled}
            value={value.unit}
            onChange={(event) => onChange({ unit: event.target.value })}
          />
        </div>
        <select
          name={withFormNames ? "storage_location_id" : undefined}
          aria-label="Storage location"
          className={SELECT_CLASS}
          disabled={disabled}
          value={value.storage_location_id}
          onChange={(event) =>
            onChange({ storage_location_id: event.target.value })
          }
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
          name={withFormNames ? "expiry_date" : undefined}
          type="date"
          aria-label="Expiry date"
          disabled={disabled}
          value={value.expiry_date}
          onChange={(event) => onChange({ expiry_date: event.target.value })}
        />
      </div>

      {isLoadingDefaults ? (
        <p className="text-xs text-muted">Checking community food knowledge…</p>
      ) : classification ? (
        <span
          className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${tierBadgeClasses(
            classification.tier
          )}`}
        >
          {classification.categoryName ?? UNCLASSIFIED_LABEL}
          <span className="opacity-70">· {tierLabel(classification.tier)}</span>
        </span>
      ) : null}
    </div>
  );
}
