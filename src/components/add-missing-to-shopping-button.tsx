"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { addMissingIngredientsToShoppingList } from "@/app/actions/shopping-list";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type AddMissingToShoppingButtonProps = {
  missingIngredients: string[];
  variant?: "default" | "outline";
  size?: "default" | "sm";
  className?: string;
};

export function AddMissingToShoppingButton({
  missingIngredients,
  variant = "default",
  size = "default",
  className,
}: AddMissingToShoppingButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [result, setResult] = useState<{
    added: number;
    skippedExisting: number;
    skippedPantry: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = missingIngredients
    .map((item) => item.trim())
    .filter(Boolean);

  if (filtered.length === 0) {
    return null;
  }

  const handleAdd = async () => {
    setIsAdding(true);
    setError(null);
    setResult(null);

    try {
      const response = await addMissingIngredientsToShoppingList(filtered);
      setResult(response);
    } catch (addError) {
      setError(
        addError instanceof Error
          ? addError.message
          : "Unable to add items to your shopping list."
      );
    } finally {
      setIsAdding(false);
    }
  };

  const buttonVariant = variant === "outline" ? "secondary" : "primary";
  const sizeClass = size === "sm" ? "h-10 px-4 text-sm" : "h-11 px-5";

  if (result) {
    if (result.added === 0) {
      return (
        <div className={cn("flex flex-col gap-2", className)}>
          <p className="text-sm text-muted">
            Everything required is already in your pantry or shopping list.
          </p>
        </div>
      );
    }

    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <p className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300">
          ✓ Added {result.added} ingredient{result.added === 1 ? "" : "s"} to
          your shopping list.
        </p>
        <Link href="/shopping">
          <Button type="button" variant="secondary" className="gap-2">
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            View Shopping List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button
        type="button"
        variant={buttonVariant}
        onClick={() => void handleAdd()}
        disabled={isAdding}
        className={cn("gap-2", sizeClass)}
      >
        <ShoppingCart className="h-4 w-4" aria-hidden="true" />
        {isAdding ? "Adding…" : "Add Missing Items to Shopping List"}
      </Button>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
