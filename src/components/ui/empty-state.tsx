import Link from "next/link";
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
    <Card className="flex flex-col items-center px-8 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        {icon}
      </div>
      <h3 className="mt-8 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
      {(primaryAction || secondaryAction) && (
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          {primaryAction && (
            <Link href={primaryAction.href}>
              <Button className="h-12 w-full px-8 sm:w-auto">
                {primaryAction.label}
              </Button>
            </Link>
          )}
          {secondaryAction &&
            (secondaryAction.href ? (
              <Link href={secondaryAction.href}>
                <Button variant="secondary" className="h-12 w-full px-8 sm:w-auto">
                  {secondaryAction.label}
                </Button>
              </Link>
            ) : (
              <Button
                variant="secondary"
                disabled={secondaryAction.disabled}
                className="h-12 w-full px-8 sm:w-auto"
              >
                {secondaryAction.label}
              </Button>
            ))}
        </div>
      )}
    </Card>
  );
}
