import { cn } from "@/lib/cn";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "text-sm font-medium text-slate-700 dark:text-slate-200",
        className
      )}
      {...props}
    />
  );
}
