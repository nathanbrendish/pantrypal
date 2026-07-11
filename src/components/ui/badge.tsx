import { cn } from "@/lib/cn";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "muted";
  className?: string;
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" &&
          "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
        variant === "muted" &&
          "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
        className
      )}
    >
      {children}
    </span>
  );
}
