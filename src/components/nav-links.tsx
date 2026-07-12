"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const links = [
  { href: "/dashboard", label: "Home" },
  { href: "/pantry", label: "Pantry" },
  { href: "/receipt-scanner", label: "Scan" },
  { href: "/meals", label: "Meals" },
  { href: "/recipes", label: "Recipes" },
  { href: "/saved-meals", label: "Saved" },
  { href: "/planner", label: "Planner" },
  { href: "/shopping", label: "Shopping" },
  { href: "/settings", label: "Settings" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden flex-wrap items-center gap-1 lg:flex">
      {links.map(({ href, label }) => {
        const isActive =
          pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-600/30",
              isActive
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
