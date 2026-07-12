import { cn } from "@/lib/cn";
import { ds } from "@/lib/design-system";

type FilterBarProps = {
  children: React.ReactNode;
  className?: string;
};

export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div
      className={cn(
        ds.card,
        "p-[var(--ds-space-lg)] sm:p-[var(--ds-space-xl)]",
        className
      )}
    >
      <div className="grid gap-[var(--ds-space-md)] sm:grid-cols-2 lg:grid-cols-4">
        {children}
      </div>
    </div>
  );
}

type FilterSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function FilterSelect({ className, ...props }: FilterSelectProps) {
  return (
    <select
      className={cn(
        "h-[var(--ds-height-control)] rounded-[var(--ds-radius-md)] border border-border bg-card px-[var(--ds-space-md)] text-sm text-foreground shadow-sm",
        className
      )}
      {...props}
    />
  );
}
