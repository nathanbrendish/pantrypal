import { cn } from "@/lib/cn";
import { ds } from "@/lib/design-system";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "success";
  size?: "default" | "lg" | "icon" | "sm";
};

const variants = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover focus-visible:ring-primary/30",
  secondary:
    "border border-border bg-card text-foreground shadow-sm hover:bg-background focus-visible:ring-border-strong",
  outline:
    "border-2 border-primary bg-transparent text-primary hover:bg-primary-soft focus-visible:ring-primary/30",
  success:
    "bg-success text-inverse shadow-sm hover:bg-success-hover focus-visible:ring-success/30",
  danger:
    "border border-danger/20 bg-danger-soft text-danger-foreground hover:bg-danger-soft focus-visible:ring-danger/30",
  ghost:
    "bg-transparent text-muted hover:bg-background hover:text-foreground focus-visible:ring-border-strong",
};

const sizes = {
  sm: "h-[var(--ds-height-control-sm)] px-3.5 text-sm rounded-[var(--ds-radius-md)]",
  default:
    "h-[var(--ds-height-control)] px-5 text-sm rounded-[var(--ds-radius-md)]",
  lg: "h-[var(--ds-height-control-lg)] min-h-[var(--ds-height-control-lg)] px-6 text-base rounded-[var(--ds-radius-lg)]",
  icon: "h-[var(--ds-height-control)] w-[var(--ds-height-control)] rounded-[var(--ds-radius-md)]",
};

export function Button({
  className,
  variant = "primary",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium outline-none transition-[colors,transform,box-shadow] duration-[var(--ds-duration-fast)] focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-[var(--ds-opacity-disabled)] disabled:active:scale-100",
        ds.press,
        ds.buttonText,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function PrimaryButton(props: Omit<ButtonProps, "variant">) {
  return <Button variant="primary" {...props} />;
}

export function SecondaryButton(props: Omit<ButtonProps, "variant">) {
  return <Button variant="secondary" {...props} />;
}

export function DangerButton(props: Omit<ButtonProps, "variant">) {
  return <Button variant="danger" {...props} />;
}
