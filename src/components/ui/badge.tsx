import { cn } from "@/lib/cn";

type StatusBadgeProps = {
  children: React.ReactNode;
  variant?:
    | "default"
    | "muted"
    | "success"
    | "warning"
    | "danger"
    | "orange"
    | "fresh"
    | "info";
  className?: string;
};

const variants = {
  default: "bg-primary-soft text-primary",
  muted: "bg-background text-muted",
  success: "bg-success-soft text-success-foreground",
  fresh: "bg-fresh-soft text-fresh",
  warning: "bg-warning-soft text-warning-foreground",
  orange: "bg-expiring-soft text-expiring",
  danger: "bg-danger-soft text-danger-foreground",
  info: "bg-info-soft text-info",
};

export function StatusBadge({
  children,
  variant = "default",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

/** @deprecated Prefer StatusBadge */
export function Badge(props: StatusBadgeProps) {
  return <StatusBadge {...props} />;
}

export function ExpiryBadge({
  label,
  status,
}: {
  label: string;
  status: "expired" | "today" | "tomorrow" | "soon" | "ok" | "none";
}) {
  const config: Record<
    typeof status,
    { variant: StatusBadgeProps["variant"]; display: string }
  > = {
    expired: { variant: "danger", display: label || "Expired" },
    today: { variant: "danger", display: label || "Today" },
    tomorrow: { variant: "orange", display: label || "Tomorrow" },
    soon: { variant: "warning", display: label || "Soon" },
    ok: { variant: "fresh", display: label || "Fresh" },
    none: { variant: "muted", display: label || "No date" },
  };

  const { variant, display } = config[status];

  return <StatusBadge variant={variant}>{display}</StatusBadge>;
}
