import type { NextRequest } from "next/server";
import { z } from "zod";
import { isDuplicateKeyError } from "@/lib/db";
import { Activity, User } from "@/lib/models";
import { hashPassword, requireAdmin } from "@/lib/server/admin-auth";
import { error, json, readJson, zodFieldErrors } from "@/lib/server/http";
import { volunteerFields, volunteerRow } from "@/lib/server/volunteers";

const create = z.object(volunteerFields);

/** Volunteer accounts, with how many of their changes are in the task tracker. */
export async function GET(req: NextRequest) {
  const user = await requireAdmin(req, { role: "admin" });
  if (user instanceof Response) return user;
  const [volunteers, activity] = await Promise.all([
    User.find({ role: "volunteer" }, { passwordHash: 0 }).sort({ createdAt: 1 }).lean(),
    Activity.aggregate<{ _id: unknown; total: number; open: number; last: Date }>([
      { $group: { _id: "$actorId", total: { $sum: 1 }, open: { $sum: { $cond: ["$reviewed", 0, 1] } }, last: { $max: "$createdAt" } } },
    ]),
  ]);
  const byActor = new Map(activity.map((a) => [String(a._id), a]));
  return json({
    data: volunteers.map((u) => {
      const a = byActor.get(String(u._id));
      return { ...volunteerRow(u), changes: a?.total ?? 0, toReview: a?.open ?? 0, lastChangeAt: a?.last ?? null };
    }),
  });
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin(req, { role: "admin" });
  if (user instanceof Response) return user;
  const parsed = create.safeParse(await readJson(req));
  if (!parsed.success) return error(422, "Please fix the highlighted fields.", { fieldErrors: zodFieldErrors(parsed.error) });
  const { password, ...rest } = parsed.data;
  try {
    const u = await User.create({ ...rest, role: "volunteer", passwordHash: await hashPassword(password) });
    return json({ data: volunteerRow(u.toObject()) }, { status: 201 });
  } catch (err) {
    if (isDuplicateKeyError(err)) return error(409, "Someone with this e-mail can already sign in.", { fieldErrors: { email: "Already in use" } });
    throw err;
  }
}
