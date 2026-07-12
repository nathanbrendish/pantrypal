import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
    <Card className="flex flex-col items-center px-8 py-16 text-center sm:py-20">
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 text-slate-500 shadow-inner dark:from-slate-800 dark:to-slate-900 dark:text-slate-400">
        {icon}
      </div>
      <h3 className="mt-8 text-xl font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {(primaryAction || secondaryAction) && (
        <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
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
    </Card>
  );
}
