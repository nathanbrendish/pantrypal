"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { saveScannedIngredients } from "@/app/actions/receipt";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { inferExpiryDate } from "@/lib/expiry";
import { isValidIngredientName } from "@/lib/ingredient-utils";
import type { ScannedIngredient, ReviewIngredient } from "@/types/v2";

type ReceiptIngredientReviewProps = {
  initialIngredients: ScannedIngredient[];
  onCancel: () => void;
};

function createReviewIngredients(
  items: ScannedIngredient[]
): ReviewIngredient[] {
  return items.map((item) => ({
    id: crypto.randomUUID(),
    ingredient_name: item.ingredient_name,
    quantity: item.quantity,
    unit: item.unit ?? "",
    expiry_date: inferExpiryDate(item.ingredient_name) ?? "",
    checked: true,
  }));
}

export function ReceiptIngredientReview({
  initialIngredients,
  onCancel,
}: ReceiptIngredientReviewProps) {
  const router = useRouter();
  const [items, setItems] = useState<ReviewIngredient[]>(() =>
    createReviewIngredients(initialIngredients)
  );
  const [newIngredient, setNewIngredient] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateItem = (id: string, updates: Partial<ReviewIngredient>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const addIngredient = () => {
    const trimmed = newIngredient.trim();

    if (!isValidIngredientName(trimmed)) {
      return;
    }

    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        ingredient_name: trimmed,
        quantity: 1,
        unit: "",
        expiry_date: inferExpiryDate(trimmed) ?? "",
        checked: true,
      },
    ]);
    setNewIngredient("");
  };

  const handleSave = async () => {
    const selected = items
      .filter((item) => item.checked)
      .map((item) => ({
        ingredient_name: item.ingredient_name.trim(),
        quantity:
          Number.isFinite(item.quantity) && item.quantity > 0
            ? item.quantity
            : 1,
        unit: item.unit.trim() || null,
        expiry_date: item.expiry_date.trim() || null,
      }))
      .filter((item) => isValidIngredientName(item.ingredient_name));

    if (selected.length === 0) {
      setError("Select at least one ingredient to save.");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const result = await saveScannedIngredients(selected);

      if (!result.success) {
        setError(result.error);
        setIsSaving(false);
        return;
      }

      router.push(`/pantry?added=${result.added}`);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to save ingredients. Please try again."
      );
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-6 sm:p-8">
      <SectionHeader
        title="Review ingredients"
        description="Edit names, quantities, units, and expiry dates before saving."
      />

      {items.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(event) =>
                    updateItem(item.id, { checked: event.target.checked })
                  }
                  className="mt-2.5 h-5 w-5 shrink-0 rounded border-zinc-300 text-blue-600 focus:ring-blue-600/30"
                  aria-label={`Include ${item.ingredient_name}`}
                />
                <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                  <Input
                    value={item.ingredient_name}
                    onChange={(event) =>
                      updateItem(item.id, {
                        ingredient_name: event.target.value,
                      })
                    }
                    placeholder="Ingredient name"
                    aria-label="Ingredient name"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(item.id, {
                          quantity: Number.parseFloat(event.target.value) || 1,
                        })
                      }
                      placeholder="Qty"
                      aria-label="Quantity"
                    />
                    <Input
                      value={item.unit}
                      onChange={(event) =>
                        updateItem(item.id, { unit: event.target.value })
                      }
                      placeholder="Unit"
                      aria-label="Unit"
                    />
                  </div>
                  <Input
                    type="date"
                    value={item.expiry_date}
                    onChange={(event) =>
                      updateItem(item.id, { expiry_date: event.target.value })
                    }
                    className="sm:col-span-2"
                    aria-label="Expiry date"
                  />
                </div>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => removeItem(item.id)}
                  className="h-10 shrink-0 px-3"
                  aria-label={`Remove ${item.ingredient_name}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          No ingredients to review. Add items manually below.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Input
          value={newIngredient}
          onChange={(event) => setNewIngredient(event.target.value)}
          placeholder="Add an ingredient"
          className="min-w-0 flex-1"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addIngredient();
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={addIngredient}
          className="gap-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add
        </Button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400"
        >
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSaving}
          className="h-12 px-8"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="h-12 px-8"
        >
          {isSaving ? "Saving…" : "Save to Pantry"}
        </Button>
      </div>
    </Card>
  );
}
