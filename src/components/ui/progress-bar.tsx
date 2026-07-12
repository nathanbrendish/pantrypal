import { cn } from "@/lib/cn";

type ProgressBarProps = {
  value: number;
  max?: number;
  label?: string;
  className?: string;
  tone?: "blue" | "green";
};

export function ProgressBar({
  value,
  max = 100,
  label,
  className,
  tone,
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const resolvedTone = tone ?? (percent >= 100 ? "green" : "blue");

  return (
    <div className={cn("flex flex-col gap-[var(--ds-space-sm)]", className)}>
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">{label}</span>
          <span
            className={cn(
              "font-semibold",
              resolvedTone === "green" ? "text-success" : "text-muted"
            )}
          >
            {percent}%
          </span>
        </div>
      )}
      <div
        className="h-3 overflow-hidden rounded-full bg-background"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-[var(--ds-duration-slow)] ease-out",
            resolvedTone === "green"
              ? "bg-gradient-to-r from-success to-success-hover"
              : "bg-gradient-to-r from-primary to-primary-hover"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
