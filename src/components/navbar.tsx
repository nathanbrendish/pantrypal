import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChefHat } from "lucide-react";
import { NavLinks } from "@/components/nav-links";
import { MobileBottomNav, UserMenu } from "@/components/user-menu";
import { getDisplayName } from "@/components/dashboard-greeting";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-4">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
                <ChefHat className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
              PantryPal
            </Link>
            {user && (
              <div className="lg:hidden">
                <UserMenu
                  email={user.email ?? ""}
                  displayName={getDisplayName(user.user_metadata)}
                />
              </div>
            )}
          </div>

          {user && (
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
              <NavLinks />
              <div className="hidden lg:block">
                <UserMenu
                  email={user.email ?? ""}
                  displayName={getDisplayName(user.user_metadata)}
                />
              </div>
            </div>
          )}
        </div>
      </header>
      {user && <MobileBottomNav />}
    </>
  );
}
