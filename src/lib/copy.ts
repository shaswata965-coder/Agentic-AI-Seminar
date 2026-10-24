import type { SiteSettings } from "@/lib/content/types";
import { venueLine } from "@/lib/event";
import { formatDate, formatDateRange } from "@/lib/format";
import type { CopyKey, PageCopy } from "@/lib/schema/page-copy";

/*
 * Section texts from Site settings (src/lib/schema/page-copy.ts), with their
 * placeholders filled in: {event}, {short}, {dates}, {venue}, {venueName},
 * {tagline}, {organiser}, {replyBy}, plus any a section passes itself (e.g. {count}).
 */

export type Vars = Record<string, string | number>;

/** Replace known {placeholders}; unknown ones are left as typed. */
export function fill(text: string, vars: Vars): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

export function siteVars(s: SiteSettings): Vars {
  return {
    event: s.eventName,
    short: s.shortName,
    dates: formatDateRange(s.startDate, s.endDate),
    venue: venueLine(s),
    venueName: s.venueName,
    tagline: s.tagline,
    organiser: s.organisedBy.includes("IIT Delhi") ? "IIT Delhi · Yardi School of Artificial Intelligence" : s.organisedBy,
    replyBy: replyBy(s),
  };
}

/** When registrants hear whether they have a place: "by 20 November 2026", or "by e-mail" before the date is set. */
export function replyBy(s: SiteSettings) {
  const date = formatDate(s.workshopReplyBy);
  return date ? `by ${date}` : "by e-mail";
}

/** One section's texts and colours, placeholders filled in. */
export function copy<K extends CopyKey>(s: SiteSettings, key: K, extra: Vars = {}): PageCopy[K] {
  const vars = { ...siteVars(s), ...extra };
  return Object.fromEntries(Object.entries(s[key]).map(([k, v]) => [k, typeof v === "string" ? fill(v, vars) : v])) as PageCopy[K];
}

/** "1 day" / "2 days". */
export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
