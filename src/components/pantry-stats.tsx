import { Card } from "@/components/ui/card";

type PantryStatsProps = {
  ingredientCount: number;
};

export function PantryStats({ ingredientCount }: PantryStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-muted">
          Ingredient Count
        </p>
        <p className="mt-3 text-4xl font-bold text-foreground">
          {ingredientCount}
        </p>
      </Card>
      <Card className="p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-muted">
          Last Updated
        </p>
        <p className="mt-3 text-4xl font-bold text-foreground">Today</p>
      </Card>
    </div>
  );
}
