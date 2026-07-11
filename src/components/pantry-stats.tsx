import { Card } from "@/components/ui/card";

type PantryStatsProps = {
  ingredientCount: number;
};

export function PantryStats({ ingredientCount }: PantryStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Ingredient Count
        </p>
        <p className="mt-3 text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          {ingredientCount}
        </p>
      </Card>
      <Card className="p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Last Updated
        </p>
        <p className="mt-3 text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          Today
        </p>
      </Card>
    </div>
  );
}
