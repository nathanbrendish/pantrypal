"use client";

import { useActionState } from "react";
import { addIngredient } from "@/app/actions/pantry";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AddIngredientForm() {
  const [state, formAction, isPending] = useActionState(addIngredient, null);

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
            />
          </div>
          <Input
            name="expiry_date"
            type="date"
            className="sm:col-span-2"
            aria-label="Expiry date"
          />
        </div>

        <Button type="submit" disabled={isPending} className="h-12 w-fit px-8">
          {isPending ? "Adding…" : "Add to Pantry"}
        </Button>
      </form>

      {state?.error && (
        <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
          {state.error}
        </p>
      )}
    </Card>
  );
}
