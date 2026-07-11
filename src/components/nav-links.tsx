"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pantry", label: "Pantry" },
  { href: "/receipt-scanner", label: "Receipt Scanner" },
  { href: "/meals", label: "Meals" },
  { href: "/recipes", label: "Recipes" },
  { href: "/saved-meals", label: "Saved" },
  { href: "/planner", label: "Planner" },
  { href: "/shopping", label: "Shopping" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
      {links.map(({ href, label }) => {
        const isActive =
          pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative px-3 py-2.5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30",
              isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            )}
          >
            {label}
            {isActive && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
