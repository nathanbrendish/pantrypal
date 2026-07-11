import { ChefHat } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { NavLinks } from "@/components/nav-links";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-[960px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4 lg:justify-start">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
          >
            <ChefHat
              className="h-6 w-6 text-blue-600"
              aria-hidden="true"
            />
            PantryPal
          </Link>
          <div className="lg:hidden">
            <LogoutButton />
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-10">
          <NavLinks />
          <div className="hidden lg:block">
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
