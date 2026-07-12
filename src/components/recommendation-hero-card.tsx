import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { ds } from "@/lib/design-system";

type RecommendationHeroCardProps = {
  name: string;
  matchScore: number;
  href: string;
  cookHref?: string;
};

export function RecommendationHeroCard({
  name,
  matchScore,
  href,
  cookHref = "/meals",
}: RecommendationHeroCardProps) {
  return (
    <Card className="overflow-hidden border-0 p-0 shadow-md">
      <div className={ds.featuredHero}>
        <div className={ds.featuredHeroCopy}>
          <IconTile
            tone="blue"
            size="lg"
            className="bg-on-brand-subtle text-on-brand shadow-sm ring-1 ring-on-brand-border"
          >
            <Sparkles className="h-6 w-6" />
          </IconTile>

          <div className={ds.featuredHeroText}>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-on-brand-muted">
              Today&apos;s recommendation
            </p>
            <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-on-brand sm:text-3xl">
              {name}
            </h2>
            <p className="text-sm font-medium text-on-brand sm:text-base">
              {matchScore}% pantry match
            </p>
          </div>
        </div>

        <div className={ds.featuredHeroActions}>
          <Link href={cookHref}>
            <Button variant="onBrand" size="lg">
              Cook Tonight
            </Button>
          </Link>
          <Link href={href}>
            <Button variant="onBrandGhost" size="lg">
              View Recipe
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
