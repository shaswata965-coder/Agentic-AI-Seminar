/* Calendar helpers: Google / Outlook links and RFC 5545 .ics files. */

export interface CalEvent {
  uid: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  url?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** 20261215T033000Z */
export function icsDate(d: Date) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

/** 20261215 for all-day events (date in IST). */
function ymdCompact(d: Date) {
  const ist = new Date(d.getTime() + 330 * 60_000);
  return `${ist.getUTCFullYear()}${pad(ist.getUTCMonth() + 1)}${pad(ist.getUTCDate())}`;
}

function escapeIcs(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

const encoder = new TextEncoder();
const bytes = (s: string) => encoder.encode(s).length;

/** Fold long lines at 74 octets as required by RFC 5545. */
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (bytes(rest) > 74) {
    let cut = 74;
    while (bytes(rest.slice(0, cut)) > 74) cut--;
    out.push(rest.slice(0, cut));
    rest = ` ${rest.slice(cut)}`;
  }
  out.push(rest);
  return out.join("\r\n");
}

export function buildIcs(events: CalEvent[], calName = "Agentic AI Workshop 2026", stamp = new Date()) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//IIT Delhi ScAI//Agentic AI Workshop//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", `X-WR-CALNAME:${escapeIcs(calName)}`];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}`,
      `DTSTAMP:${icsDate(stamp)}`,
      `DTSTART:${icsDate(e.start)}`,
      `DTEND:${icsDate(e.end)}`,
      `SUMMARY:${escapeIcs(e.title)}`,
    );
    if (e.description) lines.push(`DESCRIPTION:${escapeIcs(e.description)}`);
    if (e.location) lines.push(`LOCATION:${escapeIcs(e.location)}`);
    if (e.url) lines.push(`URL:${e.url}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

interface LinkInput {
  title: string;
  start: Date;
  end: Date;
  details?: string;
  location?: string;
  allDay?: boolean;
}

export function googleCalendarUrl({ title, start, end, details = "", location = "", allDay }: LinkInput) {
  let dates: string;
  if (allDay) {
    const endExclusive = new Date(end.getTime() + 24 * 3600_000);
    dates = `${ymdCompact(start)}/${ymdCompact(endExclusive)}`;
  } else {
    dates = `${icsDate(start)}/${icsDate(end)}`;
  }
  const p = new URLSearchParams({ action: "TEMPLATE", text: title, dates, details, location, ctz: "Asia/Kolkata" });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function outlookCalendarUrl({ title, start, end, details = "", location = "", allDay }: LinkInput) {
  const iso = (d: Date) => (allDay ? ymdCompact(d).replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3") : d.toISOString());
  const endDate = allDay ? new Date(end.getTime() + 24 * 3600_000) : end;
  const p = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: title,
    startdt: iso(start),
    enddt: iso(endDate),
    body: details,
    location,
    ...(allDay ? { allday: "true" } : {}),
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${p.toString()}`;
}
