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
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-blue-600 text-white shadow-sm dark:bg-blue-500"
                : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
