"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UNCLASSIFIED_LABEL } from "@/lib/food-classification";
import type { PantryItem } from "@/types/pantry";
import type {
  FoodCategory,
  FoodSubcategory,
  StorageLocation,
} from "@/types/taxonomy";

const SELECT_CLASS =
  "h-[var(--ds-height-control)] w-full rounded-[var(--ds-radius-md)] border border-border bg-card px-[var(--ds-space-lg)] text-sm text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

type EditSaveData = {
  ingredient_name: string;
  quantity: number;
  unit: string | null;
  expiry_date: string | null;
  storage_location_id: string | null;
};

type PantryEditModalProps = {
  item: PantryItem | null;
  storageLocations: StorageLocation[];
  categories: FoodCategory[];
  subcategories: FoodSubcategory[];
  onClose: () => void;
  onSave: (
    id: string,
    data: EditSaveData
  ) => Promise<{ success: boolean; error?: string }>;
  onReclassify: (
    id: string,
    foodCategoryId: string,
    foodSubcategoryId: string | null
  ) => Promise<{ success: boolean; error?: string }>;
};

export function PantryEditModal({
  item,
  storageLocations,
  categories,
  subcategories,
  onClose,
  onSave,
  onReclassify,
}: PantryEditModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [isClassifying, setIsClassifying] = useState(false);
  const [classifyError, setClassifyError] = useState<string | null>(null);
  const [syncedItemId, setSyncedItemId] = useState<string | null>(null);

  // Adjust classification state when a different item is opened. Done during
  // render (React's recommended alternative to setState-in-effect).
  if (item && item.id !== syncedItemId) {
    setSyncedItemId(item.id);
    setCategoryId(item.cached_category_id ?? "");
    setSubcategoryId(item.cached_subcategory_id ?? "");
    setClassifyError(null);
  } else if (!item && syncedItemId !== null) {
    setSyncedItemId(null);
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (item) {
      dialog.showModal();
      nameRef.current?.focus();
    } else {
      dialog.close();
    }
  }, [item]);

  const availableSubcategories = useMemo(
    () => subcategories.filter((sub) => sub.food_category_id === categoryId),
    [subcategories, categoryId]
  );

  if (!item) return null;

  const currentCategoryLabel = item.cached_category?.name ?? UNCLASSIFIED_LABEL;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const result = await onSave(item.id, {
      ingredient_name: String(formData.get("ingredient_name")),
      quantity: Number.parseFloat(String(formData.get("quantity"))) || 1,
      unit: String(formData.get("unit") || "").trim() || null,
      expiry_date: String(formData.get("expiry_date") || "").trim() || null,
      storage_location_id:
        String(formData.get("storage_location_id") || "").trim() || null,
    });

    if (result.success) {
      onClose();
    }
  };

  const handleReclassify = async () => {
    if (!categoryId) {
      setClassifyError("Choose a category first.");
      return;
    }
    setIsClassifying(true);
    setClassifyError(null);
    const result = await onReclassify(
      item.id,
      categoryId,
      subcategoryId || null
    );
    setIsClassifying(false);
    if (!result.success) {
      setClassifyError(result.error ?? "Classification failed.");
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-0 shadow-xl backdrop:bg-black/40 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Edit ingredient
        </h2>

        <div className="mt-4 grid gap-3">
          <Input
            ref={nameRef}
            name="ingredient_name"
            defaultValue={item.ingredient_name}
            placeholder="Ingredient name"
            required
            aria-label="Ingredient name"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              name="quantity"
              type="number"
              min="0.01"
              step="any"
              defaultValue={item.quantity}
              required
              aria-label="Quantity"
            />
            <Input
              name="unit"
              defaultValue={item.unit ?? ""}
              placeholder="Unit"
              aria-label="Unit"
            />
          </div>
          <select
            name="storage_location_id"
            aria-label="Storage location"
            className={SELECT_CLASS}
            defaultValue={item.storage_location_id ?? ""}
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
            defaultValue={item.expiry_date ?? ""}
            aria-label="Expiry date"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>

      <div className="border-t border-zinc-200 p-6 dark:border-zinc-800">
        <p className="text-sm font-medium text-foreground">
          Food classification
        </p>
        <p className="mt-1 text-xs text-muted">
          Currently{" "}
          <span className="font-medium text-foreground">
            {currentCategoryLabel}
          </span>
          . Community learning improves this for everyone over time.
        </p>

        <div className="mt-3 grid gap-2">
          <select
            aria-label="Food category"
            className={SELECT_CLASS}
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setSubcategoryId("");
            }}
          >
            <option value="">Select a category…</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon ? `${category.icon} ` : ""}
                {category.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Food subcategory"
            className={SELECT_CLASS}
            value={subcategoryId}
            onChange={(event) => setSubcategoryId(event.target.value)}
            disabled={availableSubcategories.length === 0}
          >
            <option value="">Subcategory (optional)…</option>
            {availableSubcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void handleReclassify()}
            disabled={isClassifying}
            className="w-fit"
          >
            {isClassifying ? "Saving…" : "Suggest classification"}
          </Button>
        </div>

        {classifyError && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">
            {classifyError}
          </p>
        )}
      </div>
    </dialog>
  );
}
