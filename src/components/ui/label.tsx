import { cn } from "@/lib/cn";
import { ds } from "@/lib/design-system";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return <label className={cn(ds.label, className)} {...props} />;
}
