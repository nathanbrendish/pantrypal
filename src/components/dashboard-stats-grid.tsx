import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DashboardStats } from "@/app/actions/dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type DashboardStatsGridProps = {
  stats: DashboardStats;
};

const statCards = [
  {
    key: "pantryIngredients" as const,
    label: "Total Pantry Items",
    icon: "🥫",
    href: "/pantry",
    action: "Open Pantry",
  },
  {
    key: "expiringSoon" as const,
    label: "Items Expiring Soon",
    icon: "⏰",
    href: "/pantry",
    action: "Check Pantry",
  },
  {
    key: "mealsSaved" as const,
    label: "Saved Meals",
    icon: "🔖",
    href: "/saved-meals",
    action: "View Saved",
  },
  {
    key: "mealsAvailable" as const,
    label: "Meals Available",
    icon: "🍳",
    href: "/recipes",
    action: "Browse Recipes",
  },
  {
    key: "plannedMeals" as const,
    label: "Planned Meals This Week",
    icon: "📅",
    href: "/planner",
    action: "Open Planner",
  },
  {
    key: "shoppingListItems" as const,
    label: "Shopping List Items",
    icon: "🛒",
    href: "/shopping",
    action: "View List",
  },
];

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {statCards.map(({ key, label, icon, href, action }) => (
        <Link key={key} href={href} className="group">
          <Card className="flex h-full flex-col p-6 transition-shadow hover:shadow-md">
            <span className="text-3xl" role="img" aria-hidden="true">
              {icon}
            </span>
            <p className="mt-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {label}
            </p>
            <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats[key]}
            </p>
            <Button
              variant="secondary"
              className="mt-auto gap-2 pt-4 group-hover:border-blue-200"
              tabIndex={-1}
            >
              {action}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Card>
        </Link>
      ))}
    </div>
  );
}
