import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { z } from "zod";
import type { ActivityEntry, ActivityPage } from "@/lib/activity";
import { toPlain } from "@/lib/content/normalize";
import { Activity } from "@/lib/models";
import { requireAdmin } from "@/lib/server/admin-auth";
import { error, json, readJson } from "@/lib/server/http";

const PAGE = 50;
const isId = (id: string | null | undefined): id is string => Boolean(id && /^[a-f0-9]{24}$/i.test(id));

/** Filters shared by listing and "mark all as reviewed": ?volunteer=<user id>&area=<permission key>. */
function filterFrom(volunteer: string | null | undefined, area: string | null | undefined) {
  const filter: Record<string, unknown> = {};
  if (isId(volunteer)) filter.actorId = new mongoose.Types.ObjectId(volunteer);
  if (area) filter.area = area.slice(0, 64);
  return filter;
}

/**
 * The task tracker, newest first: ?volunteer=&area=&status=open|all&before=<cursor>.
 * Administrators see every volunteer's changes; a volunteer sees only their own.
 */
export async function GET(req: NextRequest) {
  const user = await requireAdmin(req, { everyone: true });
  if (user instanceof Response) return user;
  if (user.role === "editor") return error(403, "Only administrators can see the task tracker.");
  const q = req.nextUrl.searchParams;
  const base = filterFrom(user.role === "volunteer" ? user.id : q.get("volunteer"), q.get("area"));
  const list: Record<string, unknown> = { ...base };
  if (q.get("status") === "open") list.reviewed = false;
  const before = q.get("before");
  if (isId(before)) list._id = { $lt: new mongoose.Types.ObjectId(before) };
  const [docs, open] = await Promise.all([Activity.find(list).sort({ _id: -1 }).limit(PAGE + 1).lean(), Activity.countDocuments({ ...base, reviewed: false })]);
  const items = docs.slice(0, PAGE).map((d) => toPlain<ActivityEntry>(d));
  const page: ActivityPage = { items, next: docs.length > PAGE ? items[items.length - 1].id : null, open };
  return json({ data: page });
}

const review = z.object({
  reviewed: z.boolean(),
  /** Entries to mark. Without ids, every unreviewed entry matching the filters is marked. */
  ids: z.array(z.string().refine(isId)).max(500).optional(),
  volunteer: z.string().max(24).optional(),
  area: z.string().max(64).optional(),
});

/** Mark entries as reviewed (or not). Administrators only. */
export async function PATCH(req: NextRequest) {
  const user = await requireAdmin(req, { role: "admin" });
  if (user instanceof Response) return user;
  const parsed = review.safeParse(await readJson(req));
  if (!parsed.success) return error(400, "Invalid update.");
  const { reviewed, ids, volunteer, area } = parsed.data;
  const filter = ids ? { _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) } } : { ...filterFrom(volunteer, area), reviewed: false };
  const res = await Activity.updateMany(filter, { $set: { reviewed, reviewedBy: reviewed ? user.name || user.email : "", reviewedAt: reviewed ? new Date() : null } });
  return json({ data: { updated: res.modifiedCount } });
}
