/**
 * Returns the public site URL for auth redirects.
 * Falls back to localhost during local development.
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
