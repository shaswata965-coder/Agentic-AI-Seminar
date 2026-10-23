import "server-only";
import { settingsPagesFor } from "@/lib/permissions";
import { SETTINGS_PAGES, type SettingsPage } from "@/lib/schema/resources";
import type { AdminUser } from "./admin-auth";

/*
 * Volunteers may be given only some pages of Site settings. They read only
 * those pages' fields (plus the public event details the texts' placeholders
 * use), and what they save or preview is merged over the saved settings so
 * that only those pages' fields can change, whatever the request contains.
 */

/** Shown on every page of the site, and used by placeholders such as {event} and {dates}. */
const PLACEHOLDER_FIELDS = ["eventName", "shortName", "startDate", "endDate", "venueName", "venueHall", "tagline", "organisedBy"];

/** The top-level settings fields a page tab edits: its sections' texts and colours, their other settings, and which are hidden. */
export function pageFields(page: SettingsPage): string[] {
  return [...page.sections.flatMap((s) => [...(s.copy ? [s.copy] : []), ...s.fields.map((f) => f.name)]), ...(page.hidden ? [page.hidden.name] : [])];
}

/** Whether the user may edit every page (administrators, editors, and volunteers given all of them). */
export function editsAllSettings(user: AdminUser) {
  return settingsPagesFor(user).length === SETTINGS_PAGES.length;
}

function editableFields(user: AdminUser): Set<string> {
  return new Set(settingsPagesFor(user).flatMap(pageFields));
}

/** The settings a user may see. */
export function visibleSettings(user: AdminUser, data: object): object {
  if (editsAllSettings(user)) return data;
  const shown = new Set([...editableFields(user), ...PLACEHOLDER_FIELDS]);
  return Object.fromEntries(Object.entries(data).filter(([k]) => shown.has(k)));
}

/**
 * What a user's save (or preview) amounts to: the fields of the pages they may
 * edit taken from the request, everything else kept as saved.
 */
export function scopedSettings(user: AdminUser, saved: object, input: Record<string, unknown>): Record<string, unknown> {
  if (editsAllSettings(user)) return input;
  const merged: Record<string, unknown> = { ...saved };
  for (const name of editableFields(user)) if (Object.hasOwn(input, name)) merged[name] = input[name];
  return merged;
}

/** The pages whose fields differ between two versions of the settings ("Home, About"). */
export function changedPages(before: object | null, after: object): string[] {
  if (!before) return [];
  const was = before as Record<string, unknown>;
  const now = after as Record<string, unknown>;
  return SETTINGS_PAGES.filter((p) => pageFields(p).some((name) => JSON.stringify(was[name]) !== JSON.stringify(now[name]))).map((p) => p.title);
}
