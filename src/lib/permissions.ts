import type { FieldDef } from "@/lib/schema/fields";
import { COLLECTION_MAP, COLLECTIONS, SETTINGS_PAGES, settingsSectionFields } from "@/lib/schema/resources";

/*
 * What a volunteer may do in the admin panel. Administrators tick these when
 * they create a volunteer; the admin API enforces them (requireAdmin) and the
 * sidebar only shows what a volunteer can open. Site settings has one
 * permission per page tab, so a volunteer can be given only the pages they
 * look after. Administrators and editors are not limited by permissions.
 * Shared by client and server code.
 */

export type Role = "admin" | "editor" | "volunteer";
export type Permission = `settings:${string}` | "hackathon" | `content:${string}` | "registrations" | "enquiries" | "media" | "delete";

export interface PermissionDef {
  key: Permission;
  label: string;
  href: string;
  hint?: string;
}

export const contentPermission = (resource: string): Permission => `content:${resource}`;
export const settingsPermission = (page: string): Permission => `settings:${page}`;

const content = (key: string): PermissionDef => ({ key: contentPermission(key), label: COLLECTION_MAP[key].label, href: `/admin/content/${key}` });

/** One permission per tab of Admin → Site settings. */
export const SETTINGS_AREAS: PermissionDef[] = SETTINGS_PAGES.map((p) => ({
  key: settingsPermission(p.key),
  label: p.title,
  href: `/admin/settings?page=${p.key}`,
  hint: p.key === "site" ? "Event name and dates, registration, colours and logos, contact and notification e-mails, navigation, footer, banner, features and SEO." : undefined,
}));
export const SETTINGS_PERMISSIONS: Permission[] = SETTINGS_AREAS.map((a) => a.key);

/** The areas of the panel, grouped as in the sidebar. */
export const PERMISSION_GROUPS: { title: string; hint?: string; items: PermissionDef[] }[] = [
  { title: "Site settings", hint: "Each page's texts, colours and settings, one tab each.", items: SETTINGS_AREAS },
  { title: "Event", items: [{ key: "hackathon", label: "Hackathon", href: "/admin/hackathon" }, content("announcements")] },
  { title: "Programme", items: [content("sessions"), content("speakers"), content("tutorials"), content("demos")] },
  { title: "Content", items: [content("people"), content("kiosks"), content("sponsors"), content("faqs")] },
  { title: "Post-event", items: [content("gallery"), content("talks")] },
  {
    title: "Responses",
    items: [
      { key: "registrations", label: "Registrations", href: "/admin/registrations", hint: "Attendees' personal details: change statuses and notes, download CSVs." },
      { key: "enquiries", label: "Enquiries", href: "/admin/enquiries", hint: "Change statuses and download CSVs." },
    ],
  },
  { title: "Files", items: [{ key: "media", label: "Media library", href: "/admin/media" }] },
];

/** Not an area: lets a volunteer delete content items and media files in the areas they can edit. */
export const DELETE_PERMISSION: PermissionDef = {
  key: "delete",
  label: "Delete items",
  href: "",
  hint: "Without it they can add, edit, hide and reorder, but not delete. Registrations and enquiries can only ever be deleted by administrators.",
};

export const AREAS: PermissionDef[] = PERMISSION_GROUPS.flatMap((g) => g.items);
const KEYS = new Set<string>([...AREAS.map((p) => p.key), DELETE_PERMISSION.key]);

export const isPermission = (key: string): key is Permission => KEYS.has(key);

/**
 * A stored list of permissions as it applies today: unknown keys dropped, and
 * the single "settings" permission of older accounts read as every page of
 * Site settings.
 */
export function normalizePermissions(list: readonly unknown[] | null | undefined): Permission[] {
  const out = new Set<Permission>();
  for (const key of list ?? []) {
    if (key === "settings") SETTINGS_PERMISSIONS.forEach((p) => out.add(p));
    else if (typeof key === "string" && isPermission(key)) out.add(key);
  }
  return [...out];
}

/**
 * Where a change in the task tracker was made. Site settings is one area there
 * (its entries list the pages changed).
 */
export const ACTIVITY_AREAS: PermissionDef[] = [
  { key: "settings" as Permission, label: "Site settings", href: "/admin/settings" },
  ...AREAS.filter((a) => !SETTINGS_PERMISSIONS.includes(a.key)),
];

/** A volunteer's areas, with the pages of Site settings shown as one area when they have all of them. */
export function areasOf(permissions: readonly string[]): PermissionDef[] {
  const pages = SETTINGS_AREAS.filter((a) => permissions.includes(a.key));
  const settings: PermissionDef[] =
    pages.length === SETTINGS_AREAS.length
      ? [{ key: SETTINGS_PERMISSIONS[0], label: "Site settings (every page)", href: "/admin/settings" }]
      : pages.map((p) => ({ ...p, label: `Site settings › ${p.label}` }));
  return [...settings, ...AREAS.filter((a) => !SETTINGS_PERMISSIONS.includes(a.key) && permissions.includes(a.key))];
}

const hasMedia = (fields: FieldDef[]): boolean => fields.some((f) => f.type === "image" || f.type === "file" || ((f.type === "group" || f.type === "objectList") && hasMedia(f.fields)));

/** Every permission that edits something with an image or file field: these may upload to and pick from the media library. */
export const UPLOAD_PERMISSIONS: Permission[] = [
  "media",
  "hackathon",
  ...SETTINGS_PAGES.filter((p) => p.sections.some((s) => hasMedia(settingsSectionFields(p, s)))).map((p) => settingsPermission(p.key)),
  ...COLLECTIONS.filter((c) => hasMedia(c.fields)).map((c) => contentPermission(c.key)),
];

/** Who may read a collection: its own editors, and editors of collections that link to it (the programme lists speakers). */
export function contentReaders(resource: string): Permission[] {
  const linking = COLLECTIONS.filter((c) => c.fields.some((f) => (f.type === "ref" || f.type === "refList") && f.resource === resource));
  return [contentPermission(resource), ...linking.map((c) => contentPermission(c.key))];
}

/** Whether a signed-in user may do something (any one of several things). Administrators and editors may do everything permissions cover. */
export function can(user: { role: Role; permissions?: readonly string[] } | null | undefined, permission: Permission | readonly Permission[]): boolean {
  if (!user) return false;
  if (user.role !== "volunteer") return true;
  const wanted = typeof permission === "string" ? [permission] : permission;
  return wanted.some((p) => user.permissions?.includes(p) ?? false);
}

/** The Site settings pages a user may edit. */
export function settingsPagesFor(user: { role: Role; permissions?: readonly string[] } | null | undefined) {
  return SETTINGS_PAGES.filter((p) => can(user, settingsPermission(p.key)));
}
