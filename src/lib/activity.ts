import { ACTIVITY_AREAS } from "@/lib/permissions";

/*
 * The task tracker: what volunteers did in the admin panel. Entries are written
 * by src/lib/server/activity.ts and read by the tracker page. Shared by client
 * and server code.
 */

export const ACTIVITY_ACTIONS = ["created", "updated", "deleted", "reordered", "uploaded", "downloaded", "changed-password"] as const;
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

/** One field that changed. Empty strings mean "no value". */
export interface ActivityChange {
  field: string;
  from: string;
  to: string;
}

export interface ActivityEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  action: ActivityAction;
  /** A permission key such as "content:speakers", or "account". */
  area: string;
  /** What was changed, e.g. a speaker's name. */
  target: string;
  targetId: string;
  changes: ActivityChange[];
  reviewed: boolean;
  reviewedBy: string;
  reviewedAt: string | null;
  createdAt: string;
}

export interface ActivityPage {
  items: ActivityEntry[];
  /** Cursor for the next (older) page, or null at the end. */
  next: string | null;
  /** Entries matching the volunteer/area filters that are not reviewed yet. */
  open: number;
}

/** Where a change was made: the area's label and admin page ("account" is a user's own account). */
export function areaOf(area: string): { label: string; href: string } {
  const def = ACTIVITY_AREAS.find((a) => a.key === area);
  return def ? { label: def.label, href: def.href } : { label: area === "account" ? "Account" : area, href: "" };
}
