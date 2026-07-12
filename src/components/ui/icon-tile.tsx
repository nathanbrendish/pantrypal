import { cn } from "@/lib/cn";

type IconTileProps = {
  children: React.ReactNode;
  tone?: "blue" | "green" | "amber" | "orange" | "violet" | "rose" | "slate";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const tones = {
  blue: "bg-primary-soft text-primary",
  green: "bg-fresh-soft text-fresh",
  amber: "bg-accent-amber-soft text-accent-amber",
  orange: "bg-expiring-soft text-expiring",
  violet: "bg-accent-violet-soft text-accent-violet",
  rose: "bg-accent-rose-soft text-accent-rose",
  slate: "bg-background text-muted",
};

const sizes = {
  sm: "h-[var(--ds-height-icon-sm)] w-[var(--ds-height-icon-sm)] rounded-[var(--ds-radius-md)] text-lg",
  md: "h-[var(--ds-height-icon)] w-[var(--ds-height-icon)] rounded-[var(--ds-radius-xl)] text-2xl",
  lg: "h-[var(--ds-height-icon-lg)] w-[var(--ds-height-icon-lg)] rounded-[var(--ds-radius-lg)] text-3xl",
};

export function IconTile({
  children,
  tone = "blue",
  size = "md",
  className,
}: IconTileProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        tones[tone],
        sizes[size],
        className
      )}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
