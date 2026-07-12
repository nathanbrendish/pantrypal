"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChefHat,
  ChevronDown,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type UserMenuProps = {
  email: string;
  displayName?: string | null;
};

export function UserMenu({ email, displayName }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = (displayName ?? email)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="pp-focus-ring flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-semibold text-white">
          {initials}
        </span>
        <span className="hidden max-w-[8rem] truncate sm:inline">
          {displayName ?? email.split("@")[0]}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {displayName ?? "Your account"}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {email}
            </p>
          </div>

          <Link
            href="/settings"
            role="menuitem"
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800",
              pathname.startsWith("/settings") && "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
            )}
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            Settings
          </Link>

          <Link
            href="/settings?tab=profile"
            role="menuitem"
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <User className="h-4 w-4" aria-hidden="true" />
            Profile
          </Link>

          <form action={logout} className="border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Home", Icon: ChefHat },
    { href: "/pantry", label: "Pantry", emoji: "🥫" },
    { href: "/planner", label: "Plan", emoji: "📅" },
    { href: "/shopping", label: "Shop", emoji: "🛒" },
    { href: "/settings", label: "Settings", Icon: Settings },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur-md lg:hidden dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex min-w-[3.5rem] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium",
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              {"Icon" in link && link.Icon ? (
                <link.Icon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <span className="text-base" aria-hidden="true">
                  {"emoji" in link ? link.emoji : null}
                </span>
              )}
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
