export const EVENT_TZ = "Asia/Kolkata";
const IST_OFFSET_MIN = 330;

function parse(iso?: string | null): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) {
  const d = parse(iso);
  if (!d) return "";
  return new Intl.DateTimeFormat("en-IN", { timeZone: EVENT_TZ, ...opts }).format(d);
}

export function formatDateTime(iso: string | null | undefined) {
  return formatDate(iso, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}

/** "15–16 December 2026" (or "30 Nov – 1 Dec 2026") */
export function formatDateRange(startIso: string, endIso: string) {
  const s = parse(startIso);
  const e = parse(endIso);
  if (!s) return "";
  if (!e) return formatDate(startIso);
  const part = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-IN", { timeZone: EVENT_TZ, ...o }).format(d);
  const sm = part(s, { month: "long", year: "numeric" });
  const em = part(e, { month: "long", year: "numeric" });
  if (sm === em) {
    const sd = part(s, { day: "numeric" });
    const ed = part(e, { day: "numeric" });
    return sd === ed ? `${sd} ${sm}` : `${sd}–${ed} ${sm}`;
  }
  return `${part(s, { day: "numeric", month: "short" })} – ${part(e, { day: "numeric", month: "short", year: "numeric" })}`;
}

/** YYYY-MM-DD (IST) of the n-th event day (1-based). */
export function eventDayDate(startIso: string, day: number | string): string {
  const s = parse(startIso);
  if (!s) return "";
  const ist = new Date(s.getTime() + IST_OFFSET_MIN * 60_000);
  ist.setUTCDate(ist.getUTCDate() + (Number(day) - 1));
  return ist.toISOString().slice(0, 10);
}

/** Label for an event day: "Tue, 15 Dec". */
export function eventDayLabel(startIso: string, day: number | string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) {
  const ymd = eventDayDate(startIso, day);
  if (!ymd) return `Day ${day}`;
  return formatDate(`${ymd}T12:00:00+05:30`, opts);
}

/** Convert an IST date (YYYY-MM-DD) + time (HH:mm) to a Date. */
export function istDateTime(ymd: string, hhmm: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd) || !/^\d{1,2}:\d{2}$/.test(hhmm)) return null;
  const [h, m] = hhmm.split(":");
  return parse(`${ymd}T${h.padStart(2, "0")}:${m}:00+05:30`);
}

/** Admin datetime-local value ("2026-12-15T09:00") ⇄ stored ISO in IST. */
export function localInputToIso(value: string): string {
  if (!value) return "";
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(value)) return value;
  const v = value.length === 16 ? `${value}:00` : value;
  return `${v}+05:30`;
}
export function isoToLocalInput(iso: string): string {
  const d = parse(iso);
  if (!d) return "";
  const ist = new Date(d.getTime() + IST_OFFSET_MIN * 60_000);
  return ist.toISOString().slice(0, 16);
}

export function timeRange(start?: string, end?: string) {
  if (!start) return "";
  return end ? `${start} – ${end}` : start;
}

export function initials(name: string) {
  const parts = name
    .replace(/^(prof|dr|mr|ms|mrs)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/^(prof|dr)\.?\s+/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
