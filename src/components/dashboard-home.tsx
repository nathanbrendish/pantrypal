import Link from "next/link";
import { Calendar, ChefHat, ShoppingCart } from "lucide-react";
import type { DashboardHomeData } from "@/app/actions/dashboard";
import { DashboardGreeting } from "@/components/dashboard-greeting";
import { DashboardStatsGrid } from "@/components/dashboard-stats-grid";
import { RecommendationHeroCard } from "@/components/recommendation-hero-card";
import { ExpiryBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IconTile } from "@/components/ui/icon-tile";
import { ProgressBar } from "@/components/ui/progress-bar";
import { QuickActionCard } from "@/components/ui/quick-action-card";

type DashboardHomeProps = {
  firstName: string | null;
  data: DashboardHomeData;
};

export function DashboardHome({ firstName, data }: DashboardHomeProps) {
  const { stats, recommendation, expiringItems, weekPlan, shoppingSummary } =
    data;

  const quickActions = [
    {
      href: "/receipt-scanner",
      icon: "📷",
      title: "Scan Receipt",
      description: "Import groceries instantly",
      accent: "blue" as const,
    },
    {
      href: "/pantry",
      icon: "🥫",
      title: "Pantry",
      description: `${stats.pantryIngredients} ingredient${stats.pantryIngredients === 1 ? "" : "s"}`,
      accent: "emerald" as const,
    },
    {
      href: "/meals",
      icon: "🍽️",
      title: "Meals",
      description: `${stats.mealsAvailable} recipes available`,
      accent: "amber" as const,
    },
    {
      href: "/planner",
      icon: "📅",
      title: "Planner",
      description: `${stats.plannedMeals} meal${stats.plannedMeals === 1 ? "" : "s"} planned`,
      accent: "violet" as const,
    },
    {
      href: "/shopping",
      icon: "🛒",
      title: "Shopping",
      description: `${stats.shoppingListItems} item${stats.shoppingListItems === 1 ? "" : "s"} remaining`,
      accent: "rose" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-12 pb-24 lg:pb-4">
      <DashboardGreeting firstName={firstName} />

      {recommendation && (
        <div className="pp-slide-up">
          <RecommendationHeroCard
            name={recommendation.name}
            matchScore={recommendation.matchScore}
            href={recommendation.href}
          />
        </div>
      )}

      <section className="pp-fade-in">
        <h2 className="mb-5 text-lg font-semibold text-foreground">
          Statistics
        </h2>
        <DashboardStatsGrid stats={stats} />
      </section>

      <section>
        <h2 className="mb-5 text-lg font-semibold text-foreground">
          Quick actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {quickActions.map((action) => (
            <QuickActionCard key={action.href} {...action} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Expiring soon
          </h2>
          <Link
            href="/pantry"
            className="text-sm font-medium text-primary"
          >
            View pantry
          </Link>
        </div>
        {expiringItems.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted">
              Nothing expiring soon — your pantry looks fresh.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {expiringItems.map((item, index) => (
              <Card
                key={item.id}
                className="pp-slide-up flex items-center justify-between gap-4 px-5 py-4"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <span className="font-medium text-foreground">
                  {item.name}
                </span>
                <ExpiryBadge label={item.expiryLabel} status={item.status} />
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Shopping summary
          </h2>
          <Link
            href="/shopping"
            className="text-sm font-medium text-primary"
          >
            View list
          </Link>
        </div>
        <Card className="p-6 sm:p-7">
          {shoppingSummary.total === 0 ? (
            <div className="flex items-center gap-4">
              <IconTile tone="green" size="lg">
                <ShoppingCart className="h-6 w-6" />
              </IconTile>
              <div>
                <p className="font-semibold text-foreground">
                  You&apos;re fully stocked
                </p>
                <p className="mt-1 text-sm text-muted">
                  Your shopping list is clear.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">
                  {shoppingSummary.unchecked} items left to buy
                </span>
                <span className="font-semibold text-emerald-600">
                  {Math.round(
                    (shoppingSummary.checked /
                      Math.max(shoppingSummary.total, 1)) *
                      100
                  )}
                  % complete
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
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Meal plan
          </h2>
          <Link
            href="/planner"
            className="text-sm font-medium text-primary"
          >
            Open planner
          </Link>
        </div>
        {weekPlan.length === 0 ? (
          <Card className="flex flex-col items-center p-10 text-center">
            <IconTile tone="violet" size="lg">
              <Calendar className="h-6 w-6" />
            </IconTile>
            <p className="mt-5 text-sm text-muted">
              No meals planned yet. Generate a plan to get started.
            </p>
            <Link href="/planner" className="mt-5">
              <Button>Plan your week</Button>
            </Link>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {weekPlan.map((item) => (
              <Card key={item.id} className="flex items-center gap-4 px-5 py-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-sm font-bold text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
                  {item.dayLabel.replace("Day ", "D")}
                </span>
                <span className="font-medium text-foreground">
                  {item.mealName}
                </span>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Saved meals
          </h2>
          <Link
            href="/saved-meals"
            className="text-sm font-medium text-primary"
          >
            View all
          </Link>
        </div>
        <Card className="flex items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-4">
            <IconTile tone="rose" size="lg">
              🔖
            </IconTile>
            <div>
              <p className="font-semibold text-foreground">
                {stats.mealsSaved} saved meal
                {stats.mealsSaved === 1 ? "" : "s"}
              </p>
              <p className="mt-1 text-sm text-muted">
                Recipes you&apos;ll want again.
              </p>
            </div>
          </div>
          <Link href="/saved-meals">
            <Button variant="secondary">Open</Button>
          </Link>
        </Card>
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
