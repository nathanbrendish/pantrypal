"use client";

import { useActionState, useState } from "react";
import { addIngredient } from "@/app/actions/pantry";
import {
  EMPTY_INGREDIENT_DRAFT,
  IngredientFields,
  type IngredientDraft,
} from "@/components/ingredient-fields";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { FoodCategory, StorageLocation } from "@/types/taxonomy";

type AddIngredientFormProps = {
  storageLocations: StorageLocation[];
  categories: FoodCategory[];
};

export function AddIngredientForm({
  storageLocations,
  categories,
}: AddIngredientFormProps) {
  const [state, formAction, isPending] = useActionState(addIngredient, null);
  const [draft, setDraft] = useState<IngredientDraft>(EMPTY_INGREDIENT_DRAFT);

  const patchDraft = (patch: Partial<IngredientDraft>) =>
    setDraft((current) => ({ ...current, ...patch }));

  return (
    <Card className="p-6 sm:p-8">
      <form action={formAction} className="flex flex-col gap-4">
        <IngredientFields
          value={draft}
          onChange={patchDraft}
          storageLocations={storageLocations}
          categories={categories}
          withFormNames
          requireName
          disabled={isPending}
        />

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
