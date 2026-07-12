import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

type FeatureCardProps = {
  icon: string;
  title: string;
  description: string;
  href?: string;
  cta?: string;
  badge?: string;
  statLabel?: string;
  statValue?: string | number;
};

export function FeatureCard({
  icon,
  title,
  description,
  href,
  cta,
  badge,
  statLabel,
  statValue,
}: FeatureCardProps) {
  const isInteractive = Boolean(href && !badge);

  const content = (
    <>
      <span className="text-4xl" role="img" aria-hidden="true">
        {icon}
      </span>

      <div className="mt-6 flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">
            {title}
          </h3>
          {badge && <Badge variant="muted">{badge}</Badge>}
        </div>

        <p className="text-sm leading-relaxed text-muted">
          {description}
        </p>

        {statLabel && statValue !== undefined && (
          <div className="mt-auto pt-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {statLabel}
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {statValue}
            </p>
          </div>
        )}

        {cta && isInteractive && (
          <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary">
            {cta}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </div>
        )}
      </div>
    </>
  );

  if (isInteractive && href) {
    return (
      <Link href={href} className="group block h-full">
        <Card
          className={cn(
            "flex h-full flex-col p-6",
            "hover:border-zinc-300 hover:shadow-md dark:hover:border-zinc-700"
          )}
        >
          {content}
        </Card>
      </Link>
    );
  }

  return <Card className="flex h-full flex-col p-6">{content}</Card>;
}
