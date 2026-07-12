import { AddMissingToShoppingButton } from "@/components/add-missing-to-shopping-button";

type MissingIngredientsSectionProps = {
  ingredients: string[];
  shoppingIngredients?: string[];
  label?: string;
  buttonVariant?: "default" | "outline";
  buttonSize?: "default" | "sm";
};

export function MissingIngredientsSection({
  ingredients,
  shoppingIngredients,
  label = "Missing",
  buttonVariant = "default",
  buttonSize = "default",
}: MissingIngredientsSectionProps) {
  const filtered = ingredients.map((item) => item.trim()).filter(Boolean);
  const shoppingPayload =
    shoppingIngredients?.map((item) => item.trim()).filter(Boolean) ?? filtered;

  if (filtered.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <ul className="flex flex-wrap gap-2">
        {filtered.map((ingredient) => (
          <li
            key={ingredient}
            className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-300"
          >
            {ingredient}
          </li>
        ))}
      </ul>
      <AddMissingToShoppingButton
        missingIngredients={shoppingPayload}
        variant={buttonVariant}
        size={buttonSize}
      />
    </div>
  );
}
