"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PantryItem } from "@/types/pantry";

type PantryEditModalProps = {
  item: PantryItem | null;
  onClose: () => void;
  onSave: (
    id: string,
    data: {
      ingredient_name: string;
      quantity: number;
      unit: string | null;
      expiry_date: string | null;
    }
  ) => Promise<{ success: boolean; error?: string }>;
};

export function PantryEditModal({
  item,
  onClose,
  onSave,
}: PantryEditModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

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

  if (!item) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const result = await onSave(item.id, {
      ingredient_name: String(formData.get("ingredient_name")),
      quantity: Number.parseFloat(String(formData.get("quantity"))) || 1,
      unit: String(formData.get("unit") || "").trim() || null,
      expiry_date: String(formData.get("expiry_date") || "").trim() || null,
    });

    if (result.success) {
      onClose();
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
    </dialog>
  );
}
