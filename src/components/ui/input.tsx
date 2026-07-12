import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { ds } from "@/lib/design-system";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error = false, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-[var(--ds-height-control)] w-full rounded-[var(--ds-radius-md)] border bg-card px-[var(--ds-space-lg)] text-sm text-foreground shadow-sm outline-none placeholder:text-muted focus:ring-2",
        ds.focusRing,
        error
          ? "border-danger focus:border-danger focus:ring-danger/20"
          : "border-border focus:border-primary focus:ring-primary/20",
        className
      )}
      {...props}
    />
  );
});
