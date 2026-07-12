"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";

const tabs = [
  { id: "profile", label: "Profile", href: "/settings?tab=profile" },
  { id: "account", label: "Account", href: "/settings?tab=account" },
  { id: "appearance", label: "Appearance", href: "/settings?tab=appearance" },
  { id: "about", label: "About", href: "/settings?tab=about" },
] as const;

export function SettingsNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "profile";

  if (pathname !== "/settings") return null;

  return (
    <nav
      aria-label="Settings"
      className="flex gap-1 overflow-x-auto rounded-[var(--ds-radius-xl)] bg-card p-1.5 shadow-sm ring-1 ring-border [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "shrink-0 rounded-[var(--ds-radius-xl)] px-4 py-2.5 text-sm font-semibold transition-all",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                : "text-muted hover:bg-background hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
