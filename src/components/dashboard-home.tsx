import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  ChefHat,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import type { DashboardHomeData } from "@/app/actions/dashboard";
import { DashboardGreeting } from "@/components/dashboard-greeting";
import { DashboardStatsGrid } from "@/components/dashboard-stats-grid";
import { Badge, ExpiryBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { QuickActionCard } from "@/components/ui/quick-action-card";
import { EmptyState } from "@/components/ui/empty-state";

type DashboardHomeProps = {
  firstName: string | null;
  data: DashboardHomeData;
};

const quickActions = [
  {
    href: "/receipt-scanner",
    icon: "📷",
    title: "Scan Receipt",
    description: "Add ingredients from a photo",
    accent: "blue" as const,
  },
  {
    href: "/pantry",
    icon: "🥫",
    title: "Pantry",
    description: "Browse and manage ingredients",
    accent: "emerald" as const,
  },
  {
    href: "/meals",
    icon: "🍽️",
    title: "Suggest Meals",
    description: "AI ideas from your pantry",
    accent: "amber" as const,
  },
  {
    href: "/planner",
    icon: "📅",
    title: "Meal Planner",
    description: "Plan your week ahead",
    accent: "violet" as const,
  },
  {
    href: "/shopping",
    icon: "🛒",
    title: "Shopping List",
    description: "See what you need to buy",
    accent: "rose" as const,
  },
];

export function DashboardHome({ firstName, data }: DashboardHomeProps) {
  const { stats, recommendation, expiringItems, weekPlan, shoppingSummary } =
    data;

  return (
    <div className="flex flex-col gap-10 pb-24 lg:pb-0">
      <DashboardGreeting firstName={firstName} />

      {recommendation && (
        <Card className="overflow-hidden p-0">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white sm:p-8">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-blue-100">
                  Today&apos;s recommendation
                </p>
                <h2 className="mt-2 text-2xl font-bold">{recommendation.name}</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-blue-100">
                  {recommendation.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Badge className="bg-white/20 text-white">
                    {recommendation.matchScore}% pantry match
                  </Badge>
                  <Link href={recommendation.href}>
                    <Button
                      variant="secondary"
                      className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                    >
                      View recipe
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Quick actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {quickActions.map((action) => (
            <QuickActionCard key={action.href} {...action} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Expiring soon
            </h2>
            <Link
              href="/pantry"
              className="text-sm font-medium text-blue-600 dark:text-blue-400"
            >
              View pantry
            </Link>
          </div>
          {expiringItems.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No ingredients expiring soon. You&apos;re all caught up.
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {expiringItems.map((item) => (
                <Card
                  key={item.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {item.name}
                  </span>
                  <ExpiryBadge
                    label={item.expiryLabel}
                    status={item.status}
                  />
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              This week&apos;s plan
            </h2>
            <Link
              href="/planner"
              className="text-sm font-medium text-blue-600 dark:text-blue-400"
            >
              Open planner
            </Link>
          </div>
          {weekPlan.length === 0 ? (
            <Card className="flex flex-col items-center p-8 text-center">
              <Calendar
                className="h-10 w-10 text-slate-400"
                aria-hidden="true"
              />
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                No meals planned yet. Generate a plan to get started.
              </p>
              <Link href="/planner" className="mt-4">
                <Button>Plan your week</Button>
              </Link>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {weekPlan.map((item) => (
                <Card
                  key={item.id}
                  className="flex items-center gap-4 p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-sm font-semibold text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
                    {item.dayLabel.replace("Day ", "D")}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {item.mealName}
                  </span>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Shopping summary
          </h2>
          <Link
            href="/shopping"
            className="text-sm font-medium text-blue-600 dark:text-blue-400"
          >
            View list
          </Link>
        </div>
        <Card className="p-6">
          {shoppingSummary.total === 0 ? (
            <div className="flex items-center gap-4">
              <ShoppingCart
                className="h-10 w-10 text-emerald-500"
                aria-hidden="true"
              />
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  Your shopping list is clear
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Everything you need is already in your pantry.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">
                  {shoppingSummary.unchecked} items left to buy
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {shoppingSummary.checked} of {shoppingSummary.total} done
                </span>
              </div>
              <ProgressBar
                value={shoppingSummary.checked}
                max={shoppingSummary.total}
              />
            </div>
          )}
        </Card>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Statistics
        </h2>
        <DashboardStatsGrid stats={stats} />
      </section>

      {stats.pantryIngredients === 0 && (
        <EmptyState
          icon={<ChefHat className="h-10 w-10" />}
          title="Let's scan your first receipt"
          description="Add ingredients to your pantry by scanning a receipt or adding them manually."
          primaryAction={{
            label: "Scan a receipt",
            href: "/receipt-scanner",
          }}
          secondaryAction={{
            label: "Add manually",
            href: "/pantry",
          }}
        />
      )}
    </div>
  );
}
