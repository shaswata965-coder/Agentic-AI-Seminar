import { COLLECTION_MAP, COLLECTIONS } from "@/lib/schema/resources";

/*
 * What a volunteer may do in the admin panel. Administrators tick these when
 * they create a volunteer; the admin API enforces them (requireAdmin) and the
 * sidebar only shows what a volunteer can open. Administrators and editors are
 * not limited by permissions. Shared by client and server code.
 */

export type Role = "admin" | "editor" | "volunteer";
export type Permission = "settings" | "hackathon" | `content:${string}` | "registrations" | "enquiries" | "media" | "delete";

export interface PermissionDef {
  key: Permission;
  label: string;
  href: string;
  hint?: string;
}

export const contentPermission = (resource: string): Permission => `content:${resource}`;

const content = (key: string): PermissionDef => ({ key: contentPermission(key), label: COLLECTION_MAP[key].label, href: `/admin/content/${key}` });

/** The areas of the panel, grouped as in the sidebar. */
export const PERMISSION_GROUPS: { title: string; items: PermissionDef[] }[] = [
  {
    title: "Event",
    items: [
      { key: "settings", label: "Site settings", href: "/admin/settings", hint: "Dates, registration, branding and feature switches." },
      { key: "hackathon", label: "Hackathon", href: "/admin/hackathon" },
      content("announcements"),
    ],
  },
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

/** Every permission that edits something with an image or file field: these may upload to and pick from the media library. */
export const UPLOAD_PERMISSIONS: Permission[] = ["media", "settings", "hackathon", ...COLLECTIONS.map((c) => contentPermission(c.key))];

/** Who may read a collection: its own editors, and editors of collections that link to it (the programme lists speakers). */
export function contentReaders(resource: string): Permission[] {
  const linking = COLLECTIONS.filter((c) => c.fields.some((f) => (f.type === "ref" || f.type === "refList") && f.resource === resource));
  return [contentPermission(resource), ...linking.map((c) => contentPermission(c.key))];
}

/** Whether a signed-in user may do something. Administrators and editors may do everything permissions cover. */
export function can(user: { role: Role; permissions?: readonly string[] } | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  if (user.role !== "volunteer") return true;
  return user.permissions?.includes(permission) ?? false;
}
