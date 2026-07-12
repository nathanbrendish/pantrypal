import { ChefHat } from "lucide-react";
import Link from "next/link";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12 sm:px-6">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link
            href="/"
            className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25"
          >
            <ChefHat className="h-8 w-8 text-white" aria-hidden="true" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {title}
            </h1>
            <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        {children}

        {footer}
      </div>
    </div>
  );
}
