import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DashboardStats } from "@/app/actions/dashboard";
import { Card } from "@/components/ui/card";

type DashboardStatsGridProps = {
  stats: DashboardStats;
};

const statCards = [
  {
    key: "pantryIngredients" as const,
    label: "Pantry items",
    icon: "🥫",
    href: "/pantry",
    accent: "from-emerald-500/10 to-emerald-600/5",
  },
  {
    key: "expiringSoon" as const,
    label: "Expiring soon",
    icon: "⏰",
    href: "/pantry",
    accent: "from-amber-500/10 to-amber-600/5",
  },
  {
    key: "mealsSaved" as const,
    label: "Saved meals",
    icon: "🔖",
    href: "/saved-meals",
    accent: "from-violet-500/10 to-violet-600/5",
  },
  {
    key: "mealsAvailable" as const,
    label: "Recipes ready",
    icon: "🍳",
    href: "/recipes",
    accent: "from-blue-500/10 to-blue-600/5",
  },
  {
    key: "plannedMeals" as const,
    label: "Planned meals",
    icon: "📅",
    href: "/planner",
    accent: "from-rose-500/10 to-rose-600/5",
  },
  {
    key: "shoppingListItems" as const,
    label: "To buy",
    icon: "🛒",
    href: "/shopping",
    accent: "from-cyan-500/10 to-cyan-600/5",
  },
];

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {statCards.map(({ key, label, icon, href, accent }) => (
        <Link key={key} href={href} className="group block h-full">
          <Card
            interactive
            className="flex h-full flex-col gap-4 p-6"
          >
            <div className="flex items-start justify-between">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl ${accent}`}
                role="img"
                aria-hidden="true"
              >
                {icon}
              </span>
              <ArrowRight
                className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500 dark:text-slate-600"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {label}
              </p>
              <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">
                {stats[key]}
              </p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
