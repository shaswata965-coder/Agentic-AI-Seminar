import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { toPlain } from "@/lib/content/normalize";
import { Enquiry } from "@/lib/models";
import { recordActivity } from "@/lib/server/activity";
import { requireAdmin } from "@/lib/server/admin-auth";
import { error, json, readJson } from "@/lib/server/http";

type Ctx = RouteContext<"/api/admin/enquiries/[id]">;
const LABELS = { status: "Status", notes: "Internal notes" } as const;

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await requireAdmin(req, { permission: "enquiries" });
  if (user instanceof Response) return user;
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) return error(404, "Not found.");
  const parsed = z.object({ status: z.enum(["new", "in-progress", "closed"]).optional(), notes: z.string().max(5000).optional() }).safeParse(await readJson(req));
  if (!parsed.success) return error(400, "Invalid update.");
  // The version before the change, for the task tracker.
  const doc = await Enquiry.findByIdAndUpdate(id, { $set: parsed.data }, { returnDocument: "before" }).lean();
  if (!doc) return error(404, "Not found.");
  const keys = Object.keys(parsed.data) as (keyof typeof LABELS)[];
  const pick = (o: Record<string, unknown>) => Object.fromEntries(keys.map((k) => [LABELS[k], o[k]]));
  await recordActivity(user, {
    action: "updated",
    area: "enquiries",
    target: `${doc.name}${doc.organisation ? ` (${doc.organisation})` : ""} · ${doc.type}`,
    targetId: id,
    diff: { before: pick(toPlain(doc)), after: pick(parsed.data) },
  });
  return json({ ok: true });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const user = await requireAdmin(req, { role: "admin" });
  if (user instanceof Response) return user;
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) return error(404, "Not found.");
  const res = await Enquiry.deleteOne({ _id: id });
  return res.deletedCount ? json({ ok: true }) : error(404, "Not found.");
}
