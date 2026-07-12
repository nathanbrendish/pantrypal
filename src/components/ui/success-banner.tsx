import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { ds } from "@/lib/design-system";
import { Small } from "@/components/ds/typography";

type InfoBannerProps = {
  message: string;
  variant?: "success" | "info" | "warning" | "danger";
  className?: string;
};

const variants = {
  success: "border-success/20 bg-success-soft text-success-foreground",
  info: "border-info/20 bg-info-soft text-primary",
  warning: "border-warning/20 bg-warning-soft text-warning-foreground",
  danger: "border-danger/20 bg-danger-soft text-danger-foreground",
};

export function InfoBanner({
  message,
  variant = "info",
  className,
}: InfoBannerProps) {
  return (
    <div
      role="status"
      className={cn(
        ds.toast,
        "flex items-start gap-[var(--ds-space-md)] rounded-[var(--ds-radius-md)] border px-[var(--ds-space-lg)] py-[var(--ds-space-md)]",
        variants[variant],
        className
      )}
    >
      {variant === "success" && (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      )}
      <Small className="text-[length:var(--ds-text-sm)] text-inherit">
        {message}
      </Small>
    </div>
  );
}

export function Toast(props: InfoBannerProps) {
  return <InfoBanner {...props} />;
}

/** @deprecated Prefer InfoBanner variant="success" */
export function SuccessBanner({ message }: { message: string }) {
  return <InfoBanner message={message} variant="success" />;
}
