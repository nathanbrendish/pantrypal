import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PlatformRole } from "@/types/community-intelligence";

type AuthenticatedPlatformContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  roles: PlatformRole[];
};

export async function getAuthenticatedPlatformContext(): Promise<AuthenticatedPlatformContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Unable to load platform roles: ${error.message}`);
  }

  return {
    supabase,
    userId: user.id,
    roles: (data ?? []).map((entry) => entry.role as PlatformRole),
  };
}

export async function requirePlatformRole(
  requiredRole: PlatformRole
): Promise<AuthenticatedPlatformContext> {
  const context = await getAuthenticatedPlatformContext();

  if (!context.roles.includes(requiredRole)) {
    redirect("/dashboard");
  }

  return context;
}

export async function requireSuperAdmin(): Promise<AuthenticatedPlatformContext> {
  return requirePlatformRole("SUPER_ADMIN");
}
