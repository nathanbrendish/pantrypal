import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type DashboardPantryCardProps = {
  ingredientCount: number;
};

export function DashboardPantryCard({
  ingredientCount,
}: DashboardPantryCardProps) {
  return (
    <Card className="flex h-full flex-col p-8">
      <span className="text-4xl" role="img" aria-hidden="true">
        🥫
      </span>

      <div className="mt-6 flex flex-1 flex-col gap-4">
        <h3 className="text-xl font-semibold text-foreground">
          Pantry
        </h3>

        <div>
          <p className="text-sm font-medium text-muted">
            Ingredients
          </p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {ingredientCount}
          </p>
        </div>

        <p className="text-sm leading-relaxed text-muted">
          View and manage everything in your kitchen.
        </p>

        <Link href="/pantry" className="mt-auto w-fit">
          <Button variant="secondary" className="gap-2">
            Open Pantry
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
