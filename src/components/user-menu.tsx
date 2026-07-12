"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChefHat,
  ChevronDown,
  LogOut,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";
import { ds } from "@/lib/design-system";

type UserMenuProps = {
  email: string;
  displayName?: string | null;
  isSuperAdmin?: boolean;
};

/** Profile dropdown — ProfileMenu in the design system. */
export function ProfileMenu({
  email,
  displayName,
  isSuperAdmin = false,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [openForPath, setOpenForPath] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isOpen = open && openForPath === pathname;

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
        onClick={() => {
          if (isOpen) {
            setOpen(false);
            return;
          }
          setOpen(true);
          setOpenForPath(pathname);
        }}
        className={cn(
          ds.focusRing,
          "flex items-center gap-2.5 rounded-[var(--ds-radius-xl)] border border-border bg-card px-2.5 py-1.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-background"
        )}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Avatar initials={initials} size="md" />
        <span className="hidden max-w-[8rem] truncate sm:inline">
          {displayName ?? email.split("@")[0]}
        </span>
        <ChevronDown
          className={cn(
            "mr-1 h-4 w-4 text-muted transition-transform",
            isOpen && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className={cn(
            ds.scaleIn,
            "absolute right-0 z-[var(--ds-z-dropdown)] mt-2 w-64 overflow-hidden rounded-[var(--ds-radius-xl)] border border-border bg-card py-2 shadow-lg"
          )}
        >
          <div className="border-b border-border px-4 py-3.5">
            <p className="truncate text-sm font-semibold text-foreground">
              {displayName ?? "Your account"}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted">{email}</p>
          </div>

          <Link
            href="/settings"
            role="menuitem"
            className={cn(
              "mx-1 mt-1 flex items-center gap-3 rounded-[var(--ds-radius-md)] px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-background",
              pathname.startsWith("/settings") &&
                "bg-primary-soft text-primary"
            )}
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            Settings
          </Link>

          <Link
            href="/settings?tab=profile"
            role="menuitem"
            className="mx-1 flex items-center gap-3 rounded-[var(--ds-radius-md)] px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-background"
          >
            <User className="h-4 w-4" aria-hidden="true" />
            Profile
          </Link>

          {isSuperAdmin && (
            <Link
              href="/platform"
              role="menuitem"
              className="mx-1 flex items-center gap-3 rounded-[var(--ds-radius-md)] px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-background"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Platform
            </Link>
          )}

          <form
            action={logout}
            className="mt-1 border-t border-border pt-1"
          >
            <button
              type="submit"
              role="menuitem"
              className="mx-1 flex w-[calc(100%-0.5rem)] items-center gap-3 rounded-[var(--ds-radius-md)] px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger-soft"
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

export function UserMenu(props: UserMenuProps) {
  return <ProfileMenu {...props} />;
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
    <nav className="fixed inset-x-0 bottom-0 z-[var(--ds-z-sticky)] border-t border-border bg-card/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex min-h-[var(--ds-height-touch)] min-w-[3.75rem] flex-col items-center justify-center gap-0.5 rounded-[var(--ds-radius-xl)] px-2 py-1.5 text-[10px] font-semibold transition-colors",
                isActive
                  ? "bg-primary-soft text-primary"
                  : "text-muted"
              )}
            >
              {"Icon" in link && link.Icon ? (
                <link.Icon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <span className="text-lg leading-none" aria-hidden="true">
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
