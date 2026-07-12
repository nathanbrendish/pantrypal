import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function DashboardMealsCard() {
  return (
    <Card className="flex h-full flex-col p-8">
      <span className="text-4xl" role="img" aria-hidden="true">
        🍽
      </span>

      <div className="mt-6 flex flex-1 flex-col gap-4">
        <h3 className="text-xl font-semibold text-foreground">
          Suggest Meals
        </h3>

        <p className="text-sm leading-relaxed text-muted">
          Discover meals using your pantry ingredients.
        </p>

        <Link href="/meals" className="mt-auto w-fit">
          <Button variant="secondary" className="gap-2">
            Suggest Meals
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
