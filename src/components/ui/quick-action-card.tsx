import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppCard } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { Heading3, Small } from "@/components/ds/typography";
import { cn } from "@/lib/cn";

type QuickActionCardProps = {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: "blue" | "emerald" | "amber" | "violet" | "rose";
};

const accentTone = {
  blue: "blue",
  emerald: "green",
  amber: "amber",
  violet: "violet",
  rose: "rose",
} as const;

export function QuickActionCard({
  href,
  icon,
  title,
  description,
  accent = "blue",
}: QuickActionCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <AppCard
        interactive
        className="flex h-full flex-col gap-[var(--ds-space-lg)] p-[var(--ds-space-xl)]"
      >
        <IconTile tone={accentTone[accent]} size="md">
          {icon}
        </IconTile>
        <div className="flex flex-1 flex-col gap-[var(--ds-space-xs)]">
          <Heading3 as="h3" className="text-base">
            {title}
          </Heading3>
          <Small className="leading-[var(--ds-leading-relaxed)]">
            {description}
          </Small>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity duration-[var(--ds-duration-fast)] group-hover:opacity-100"
          )}
        >
          Open
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </AppCard>
    </Link>
  );
}
