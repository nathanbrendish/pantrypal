import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DashboardStats } from "@/app/actions/dashboard";
import { AppCard } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { ResponsiveGrid } from "@/components/ds/layout";
import { Small } from "@/components/ds/typography";
import { ds } from "@/lib/design-system";

type DashboardStatsGridProps = {
  stats: DashboardStats;
};

const statCards = [
  {
    key: "pantryIngredients" as const,
    label: "Pantry items",
    icon: "🥫",
    href: "/pantry",
    tone: "green" as const,
  },
  {
    key: "expiringSoon" as const,
    label: "Expiring soon",
    icon: "⏰",
    href: "/pantry",
    tone: "orange" as const,
  },
  {
    key: "mealsAvailable" as const,
    label: "Recipes ready",
    icon: "🍳",
    href: "/recipes",
    tone: "blue" as const,
  },
  {
    key: "mealsSaved" as const,
    label: "Saved meals",
    icon: "🔖",
    href: "/saved-meals",
    tone: "violet" as const,
  },
  {
    key: "plannedMeals" as const,
    label: "Planned meals",
    icon: "📅",
    href: "/planner",
    tone: "amber" as const,
  },
  {
    key: "shoppingListItems" as const,
    label: "To buy",
    icon: "🛒",
    href: "/shopping",
    tone: "rose" as const,
  },
];

export function StatCard({
  label,
  value,
  icon,
  href,
  tone,
  delayMs = 0,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  href: string;
  tone: "green" | "orange" | "blue" | "violet" | "amber" | "rose";
  delayMs?: number;
}) {
  return (
    <Link href={href} className="group block h-full">
      <AppCard
        interactive
        className={`${ds.slideUp} flex h-full flex-col gap-[var(--ds-space-xl)] p-[var(--ds-space-xl)]`}
        style={{ animationDelay: `${delayMs}ms` }}
      >
        <div className="flex items-start justify-between">
          <IconTile tone={tone} size="md">
            {icon}
          </IconTile>
          <ArrowRight
            className="h-4 w-4 text-muted transition-transform duration-[var(--ds-duration-fast)] group-hover:translate-x-0.5 group-hover:text-primary"
            aria-hidden="true"
          />
        </div>
        <div>
          <Small className="font-medium">{label}</Small>
          <p className="mt-[var(--ds-space-xs)] text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>
      </AppCard>
    </Link>
  );
}

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <ResponsiveGrid variant="stats">
      {statCards.map(({ key, label, icon, href, tone }, index) => (
        <StatCard
          key={key}
          label={label}
          value={stats[key]}
          icon={icon}
          href={href}
          tone={tone}
          delayMs={index * 45}
        />
      ))}
    </ResponsiveGrid>
  );
}
