"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { completeCookedMeal } from "@/app/actions/meals";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { parseIngredientRequirement } from "@/lib/ingredient-match";

export type CookingIngredientSeed = {
  ingredient: string;
  quantityLabel?: string | null;
};

type CookingRow = {
  id: string;
  expectedIngredient: string | null;
  actualIngredient: string;
  expectedQuantity: number | null;
  expectedUnit: string | null;
  actualQuantity: number;
  actualUnit: string;
};

type CookingConfirmationModalProps = {
  recipeId?: string | null;
  recipeName: string;
  ingredients: CookingIngredientSeed[];
  onClose: () => void;
  onCooked?: () => void;
};

function buildDefaultRows(ingredients: CookingIngredientSeed[]): CookingRow[] {
  return ingredients
    .map((item, index) => {
      const parsed = parseIngredientRequirement(
        `${item.quantityLabel ?? ""} ${item.ingredient}`.trim()
      );
      return {
        id: `expected-${index}-${item.ingredient}`,
        expectedIngredient: item.ingredient,
        actualIngredient: item.ingredient,
        expectedQuantity: parsed.quantity,
        expectedUnit: parsed.unit,
        actualQuantity: parsed.quantity ?? 1,
        actualUnit: parsed.unit ?? "",
      };
    })
    .filter((item) => item.actualIngredient.trim());
}

export function CookingConfirmationModal({
  recipeId,
  recipeName,
  ingredients,
  onClose,
  onCooked,
}: CookingConfirmationModalProps) {
  const defaultRows = useMemo(() => buildDefaultRows(ingredients), [ingredients]);
  const [rows, setRows] = useState(defaultRows);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRow = (id: string, patch: Partial<CookingRow>) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  };

  const addExtra = () => {
    setRows((current) => [
      ...current,
      {
        id: `extra-${crypto.randomUUID()}`,
        expectedIngredient: null,
        actualIngredient: "",
        expectedQuantity: null,
        expectedUnit: null,
        actualQuantity: 1,
        actualUnit: "",
      },
    ]);
  };

  const removeRow = (id: string) => {
    setRows((current) => current.filter((row) => row.id !== id));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    const result = await completeCookedMeal({
      recipeId,
      recipeName,
      ingredients: rows
        .filter((row) => row.actualIngredient.trim())
        .map((row) => ({
          expectedIngredient: row.expectedIngredient,
          actualIngredient: row.actualIngredient,
          expectedQuantity: row.expectedQuantity,
          expectedUnit: row.expectedUnit,
          actualQuantity: row.actualQuantity,
          actualUnit: row.actualUnit || null,
        })),
    });

    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onCooked?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <Card
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Confirm what you used
            </h2>
            <p className="mt-1 text-sm text-muted">
              Defaults match the recipe. Change only what was different.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-background hover:text-foreground"
            aria-label="Close cooking confirmation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid gap-2 rounded-xl border border-border bg-background/60 p-3 sm:grid-cols-[1.4fr_0.8fr_0.7fr_auto]"
            >
              <div>
                <label className="text-xs font-medium text-muted">
                  {row.expectedIngredient ? "Ingredient" : "Extra ingredient"}
                </label>
                <Input
                  value={row.actualIngredient}
                  placeholder="Ingredient"
                  onChange={(event) =>
                    updateRow(row.id, { actualIngredient: event.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Used</label>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={row.actualQuantity}
                  onChange={(event) =>
                    updateRow(row.id, {
                      actualQuantity: Number.parseFloat(event.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Unit</label>
                <Input
                  value={row.actualUnit}
                  placeholder="each"
                  onChange={(event) =>
                    updateRow(row.id, { actualUnit: event.target.value })
                  }
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRow(row.id)}
                  aria-label={`Remove ${row.actualIngredient || "ingredient"}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {row.expectedIngredient && (
                <p className="text-xs text-muted sm:col-span-4">
                  Recipe: {row.expectedQuantity ?? 1}
                  {row.expectedUnit ? ` ${row.expectedUnit}` : ""}{" "}
                  {row.expectedIngredient}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Button type="button" variant="secondary" size="sm" onClick={addExtra}>
            <Plus className="h-4 w-4" />
            Add extra ingredient
          </Button>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="sm:flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating pantry...
              </>
            ) : (
              "Confirm cooked meal"
            )}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
