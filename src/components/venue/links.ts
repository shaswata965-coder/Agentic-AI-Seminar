import type { SiteSettings } from "@/lib/content/types";
import { ROUTES, type Mode } from "./delhi-map";

/** Google Maps search and directions links for the venue. */
export function mapLinks(s: SiteSettings) {
  const query = s.mapQuery || s.venueAddress || s.venueName;
  return {
    query,
    open: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`,
  };
}

/** Google Maps directions to the venue for one way of arriving, from its usual starting point. */
export function routeUrl(query: string, mode: Mode) {
  const r = (ROUTES[mode] ?? ROUTES.road)[0];
  const p = new URLSearchParams({ api: "1", destination: query, travelmode: r.travel });
  if (r.origin) p.set("origin", r.origin);
  return `https://www.google.com/maps/dir/?${p}`;
}
