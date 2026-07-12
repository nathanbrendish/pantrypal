import { cn } from "@/lib/cn";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "muted" | "success" | "warning" | "danger";
  className?: string;
};

const variants = {
  default:
    "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  muted: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  success:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  warning:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  danger: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function ExpiryBadge({
  label,
  status,
}: {
  label: string;
  status: "expired" | "today" | "tomorrow" | "soon" | "ok" | "none";
}) {
  const variant =
    status === "expired"
      ? "danger"
      : status === "today" || status === "tomorrow"
        ? "warning"
        : status === "soon"
          ? "warning"
          : "muted";

  return <Badge variant={variant}>{label}</Badge>;
}
