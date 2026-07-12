/**
 * Returns the public site URL for auth redirects and absolute links.
 * Prefer NEXT_PUBLIC_SITE_URL in every environment; production default is ShelfLife.
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL?.trim()) {
    return process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  return "https://myshelflife.co.uk";
}
