import { cn } from "@/lib/cn";
import { ds } from "@/lib/design-system";
import { SectionTitle, Small } from "@/components/ds/typography";

type ContentSectionProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function ContentSection({
  title,
  description,
  action,
  children,
  className,
}: ContentSectionProps) {
  return (
    <section className={cn(ds.sectionStack, className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-[var(--ds-space-lg)]">
          <div>
            {title && <SectionTitle>{title}</SectionTitle>}
            {description && (
              <Small className="mt-[var(--ds-space-sm)]">{description}</Small>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

type ResponsiveGridProps = {
  children: React.ReactNode;
  variant?: "stats" | "actions" | "cards";
  className?: string;
};

export function ResponsiveGrid({
  children,
  variant = "cards",
  className,
}: ResponsiveGridProps) {
  const gridClass =
    variant === "stats"
      ? ds.gridStats
      : variant === "actions"
        ? ds.gridActions
        : ds.gridCards;

  return <div className={cn(gridClass, className)}>{children}</div>;
}
