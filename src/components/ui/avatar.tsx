import { cn } from "@/lib/cn";

type AvatarProps = {
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-8 w-8 text-xs rounded-[var(--ds-radius-sm)]",
  md: "h-9 w-9 text-xs rounded-[var(--ds-radius-md)]",
  lg: "h-16 w-16 text-xl rounded-[var(--ds-radius-xl)]",
};

export function Avatar({ initials, size = "md", className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center bg-gradient-to-br from-primary to-primary-hover font-bold text-inverse shadow-sm shadow-primary/20",
        sizes[size],
        className
      )}
      aria-hidden="true"
    >
      {initials.slice(0, 2).toUpperCase()}
    </span>
  );
}
