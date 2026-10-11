/** Optional sub-path the site is served from (e.g. "/agentic-ai-workshop"). */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

/** Public origin of the site, without a trailing slash. */
export const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

/**
 * Prefix root-relative URLs (uploads, API routes) with the base path.
 * `next/link` and `next/image` already do this, so only use it for raw
 * `<img>`, `<a download>`, `fetch()` and similar.
 */
export function withBase(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("/") && !url.startsWith("//")) {
    if (BASE_PATH && url.startsWith(`${BASE_PATH}/`)) return url;
    return `${BASE_PATH}${url}`;
  }
  return url;
}

/** Absolute URL for a site path, including the base path. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_ORIGIN}${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}
