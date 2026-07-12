import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ChefHat } from "lucide-react";
import { NavLinks } from "@/components/nav-links";
import { MobileBottomNav, UserMenu } from "@/components/user-menu";
import { getDisplayName } from "@/lib/user-name";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <header className="sticky top-0 z-[var(--ds-z-nav)] border-b border-border/90 bg-card/85 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-[var(--ds-container-xl)] items-center justify-between gap-[var(--ds-space-xl)] px-[var(--ds-space-lg)] py-[var(--ds-space-md)] sm:px-[var(--ds-space-xl)] lg:py-[var(--ds-space-lg)]">
          <Link
            href="/dashboard"
            className="group flex items-center gap-[var(--ds-space-md)] text-xl font-bold tracking-tight text-foreground"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-[var(--ds-radius-xl)] bg-gradient-to-br from-primary to-primary-hover shadow-primary transition-transform group-hover:scale-105">
              <ChefHat className="h-6 w-6 text-inverse" aria-hidden="true" />
            </span>
            <span className="hidden sm:inline">ShelfLife</span>
          </Link>

          {user && (
            <>
              <div className="hidden flex-1 justify-center lg:flex">
                <NavLinks />
              </div>
              <UserMenu
                email={user.email ?? ""}
                displayName={getDisplayName(user.user_metadata)}
              />
            </>
          )}
        </div>
      </header>
      {user && <MobileBottomNav />}
    </>
  );
}
