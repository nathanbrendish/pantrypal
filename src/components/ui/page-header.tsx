import { cn } from "@/lib/cn";
import { Heading1, Small } from "@/components/ds/typography";

type PageHeaderProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
};

export function PageHeader({
  title,
  description,
  icon,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-[var(--ds-space-lg)] sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-[var(--ds-space-lg)]">
        {icon && (
          <span
            className="flex h-[var(--ds-height-icon-lg)] w-[var(--ds-height-icon-lg)] shrink-0 items-center justify-center rounded-[var(--ds-radius-lg)] bg-primary-soft text-2xl shadow-sm"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <div>
          <Heading1 as="h1">{title}</Heading1>
          {description && (
            <Small className="mt-[var(--ds-space-sm)] max-w-2xl text-[length:var(--ds-text-body)] leading-[var(--ds-leading-relaxed)]">
              {description}
            </Small>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
