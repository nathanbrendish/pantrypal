import { cn } from "@/lib/cn";
import { ds } from "@/lib/design-system";

type AppCardProps = React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
};

/** Shared elevated surface — use everywhere instead of ad-hoc card styles. */
export function AppCard({
  className,
  interactive = false,
  ...props
}: AppCardProps) {
  return (
    <div
      className={cn(
        ds.card,
        interactive && cn(ds.cardInteractive, "cursor-pointer"),
        className
      )}
      {...props}
    />
  );
}

/** @deprecated Prefer AppCard — kept for existing imports. */
export function Card(props: AppCardProps) {
  return <AppCard {...props} />;
}
