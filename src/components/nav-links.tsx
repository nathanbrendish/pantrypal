"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { ds } from "@/lib/design-system";

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

export function NavLinks({ isSuperAdmin = false }: { isSuperAdmin?: boolean }) {
  const pathname = usePathname();
  const visibleLinks = isSuperAdmin
    ? [...links, { href: "/platform", label: "Platform" }]
    : links;

  return (
    <nav className="flex flex-wrap items-center justify-center gap-1">
      {visibleLinks.map(({ href, label }) => {
        const isActive =
          pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              ds.focusRing,
              "rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-[var(--ds-duration-fast)]",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                : "text-muted hover:bg-background hover:text-foreground"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
