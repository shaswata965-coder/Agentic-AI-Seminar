import { googleCalendarUrl, outlookCalendarUrl } from "./calendar";
import type { SiteSettings } from "./content/types";
import { eventDayDate, formatDate, formatDateRange, istDateTime } from "./format";
import { absoluteUrl } from "./paths";

export interface EventDay {
  day: number;
  date: string;
  start: Date;
  end: Date;
}

/** One entry per event day, each from the start time to the end time (IST). */
export function eventDays(s: SiteSettings): EventDay[] {
  const start = new Date(s.startDate);
  const end = new Date(s.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  const startTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }).format(start);
  const endTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false }).format(end);
  const first = eventDayDate(s.startDate, 1);
  const last = eventDayDate(s.endDate, 1);
  const count = Math.max(1, Math.round((Date.parse(last) - Date.parse(first)) / 86_400_000) + 1);
  return Array.from({ length: Math.min(count, 7) }, (_, i) => {
    const date = eventDayDate(s.startDate, i + 1);
    return {
      day: i + 1,
      date,
      start: istDateTime(date, startTime) ?? start,
      end: istDateTime(date, endTime) ?? end,
    };
  });
}

/** "Agentic AI Workshop 2026" → { title: "Agentic AI Workshop", year: "2026" }. Names without a trailing year keep it empty. */
export function splitEventName(name: string): { title: string; year: string } {
  const m = name.trim().match(/^(.+?)\s+(20\d\d)$/);
  return m ? { title: m[1], year: m[2] } : { title: name.trim(), year: "" };
}

/** Event name and year for the logo: the year comes from the name, or else from the start date. */
export function brandName(s: SiteSettings): { title: string; year: string } {
  const { title, year } = splitEventName(s.eventName);
  return { title, year: year || formatDate(s.startDate, { year: "numeric" }) };
}

export function venueLine(s: SiteSettings) {
  return [s.venueHall, s.venueName].filter(Boolean).join(", ");
}

export function eventSummary(s: SiteSettings) {
  return `${s.eventName} · ${formatDateRange(s.startDate, s.endDate)} · ${venueLine(s)}`;
}

export interface CalendarLinks {
  google: string;
  outlook: string;
  ics: string;
}

export function eventCalendarLinks(s: SiteSettings): CalendarLinks {
  const start = new Date(s.startDate);
  const end = new Date(s.endDate);
  const details = `${s.tagline}\n\n${absoluteUrl("/")}`;
  const location = s.venueAddress || venueLine(s);
  return {
    google: googleCalendarUrl({ title: s.eventName, start, end, details, location, allDay: true }),
    outlook: outlookCalendarUrl({ title: s.eventName, start, end, details, location, allDay: true }),
    ics: "/api/calendar",
  };
}

/** True once a registration deadline (ISO date-time) has passed. */
export function deadlinePassed(iso: string | null | undefined, now = Date.now()): boolean {
  if (!iso) return false;
  const t = Date.parse(iso);
  return !Number.isNaN(t) && now >= t;
}

export function registrationHref(s: SiteSettings) {
  return s.workshopUrl || "/register";
}
export function hackathonRegistrationHref(s: SiteSettings) {
  return s.hackathonUrl || "/hackathon/register";
}
