import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppCard } from "@/components/ui/card";
import { Heading3, Small } from "@/components/ds/typography";
import { cn } from "@/lib/cn";
import { ds } from "@/lib/design-system";

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    disabled?: boolean;
  };
};

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <AppCard
      className={cn(
        ds.fadeIn,
        "flex flex-col items-center px-[var(--ds-space-2xl)] py-[var(--ds-space-4xl)] text-center"
      )}
    >
      <div className="flex h-24 w-24 items-center justify-center rounded-[var(--ds-radius-2xl)] bg-gradient-to-br from-background to-card text-muted shadow-inner ring-1 ring-border">
        {icon}
      </div>
      <Heading3 as="h3" className="mt-[var(--ds-space-2xl)]">
        {title}
      </Heading3>
      <Small className="mt-[var(--ds-space-md)] max-w-md leading-[var(--ds-leading-relaxed)]">
        {description}
      </Small>
      {(primaryAction || secondaryAction) && (
        <div className="mt-[var(--ds-space-3xl)] flex w-full max-w-sm flex-col gap-[var(--ds-space-md)] sm:flex-row sm:justify-center">
          {primaryAction && (
            <Link href={primaryAction.href} className="flex-1 sm:flex-none">
              <Button size="lg" className="w-full gap-2">
                {primaryAction.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          )}
          {secondaryAction &&
            (secondaryAction.href ? (
              <Link href={secondaryAction.href} className="flex-1 sm:flex-none">
                <Button variant="secondary" size="lg" className="w-full">
                  {secondaryAction.label}
                </Button>
              </Link>
            ) : (
              <Button
                variant="secondary"
                size="lg"
                disabled={secondaryAction.disabled}
                className="w-full flex-1 sm:flex-none"
              >
                {secondaryAction.label}
              </Button>
            ))}
        </div>
      )}
    </AppCard>
  );
}
