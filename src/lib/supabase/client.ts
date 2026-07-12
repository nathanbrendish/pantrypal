import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  console.log("[supabase-debug:browser] SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log(
    "[supabase-debug:browser] SUPABASE_KEY_PREFIX:",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 25)
  );

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
