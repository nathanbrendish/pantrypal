import { ChefHat } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Heading1, Small } from "@/components/ds/typography";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthLayoutProps) {
  return (
    <div
      className={cn(
        "flex min-h-full flex-1 items-center justify-center px-[var(--ds-space-lg)] py-[var(--ds-space-3xl)] sm:px-[var(--ds-space-xl)]",
        className
      )}
    >
      <div
        className="flex w-full flex-col items-center gap-[var(--ds-space-2xl)]"
        style={{ maxWidth: "var(--ds-container-auth)" }}
      >
        <div className="flex flex-col items-center gap-[var(--ds-space-lg)] text-center">
          <Link
            href="/"
            className="flex h-16 w-16 items-center justify-center rounded-[var(--ds-radius-2xl)] bg-gradient-to-br from-primary to-primary-hover shadow-primary"
          >
            <ChefHat className="h-8 w-8 text-inverse" aria-hidden="true" />
          </Link>
          <div>
            <Heading1 as="h1" className="text-[length:var(--ds-text-h2)] sm:text-[length:var(--ds-text-h1)]">
              {title}
            </Heading1>
            <Small className="mt-[var(--ds-space-sm)] text-[length:var(--ds-text-body)]">
              {subtitle}
            </Small>
          </div>
        </div>

        {children}
        {footer}
      </div>
    </div>
  );
}

type FormLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export function FormLayout({ children, className }: FormLayoutProps) {
  return (
    <div className={cn("flex flex-col gap-[var(--ds-space-xl)]", className)}>
      {children}
    </div>
  );
}
