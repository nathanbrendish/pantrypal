import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

type QuickActionCardProps = {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: "blue" | "emerald" | "amber" | "violet" | "rose";
};

const accents = {
  blue: "from-blue-500/10 to-blue-600/5 text-blue-600 dark:text-blue-400",
  emerald:
    "from-emerald-500/10 to-emerald-600/5 text-emerald-600 dark:text-emerald-400",
  amber: "from-amber-500/10 to-amber-600/5 text-amber-600 dark:text-amber-400",
  violet:
    "from-violet-500/10 to-violet-600/5 text-violet-600 dark:text-violet-400",
  rose: "from-rose-500/10 to-rose-600/5 text-rose-600 dark:text-rose-400",
};

export function QuickActionCard({
  href,
  icon,
  title,
  description,
  accent = "blue",
}: QuickActionCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <Card
        interactive
        className="flex h-full flex-col gap-4 p-5 sm:p-6"
      >
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl",
            accents[accent]
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-blue-400">
          Open
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Card>
    </Link>
  );
}
