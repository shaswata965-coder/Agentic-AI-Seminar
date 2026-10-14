import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { toPlain } from "@/lib/content/normalize";
import { HackathonRegistration, Registration } from "@/lib/models";
import { recordActivity } from "@/lib/server/activity";
import { requireAdmin } from "@/lib/server/admin-auth";
import { error, json, readJson } from "@/lib/server/http";

type Ctx = RouteContext<"/api/admin/registrations/[id]">;
const patch = z.object({ status: z.string().max(30).optional(), notes: z.string().max(5000).optional() });
const LABELS = { status: "Status", notes: "Internal notes" } as const;

function modelFor(req: NextRequest) {
  return req.nextUrl.searchParams.get("type") === "hackathon" ? "hackathon" : "workshop";
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await requireAdmin(req, { permission: "registrations" });
  if (user instanceof Response) return user;
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) return error(404, "Not found.");
  const parsed = patch.safeParse(await readJson(req));
  if (!parsed.success) return error(400, "Invalid update.");
  const allowed = modelFor(req) === "hackathon" ? ["registered", "shortlisted", "not-shortlisted", "withdrawn"] : ["registered", "confirmed", "waitlisted", "cancelled"];
  if (parsed.data.status && !allowed.includes(parsed.data.status)) return error(400, "Invalid status.");
  // The version before the change, for the task tracker.
  const doc =
    modelFor(req) === "hackathon"
      ? await HackathonRegistration.findByIdAndUpdate(id, { $set: parsed.data }, { returnDocument: "before" }).lean()
      : await Registration.findByIdAndUpdate(id, { $set: parsed.data }, { returnDocument: "before" }).lean();
  if (!doc) return error(404, "Not found.");
  const keys = Object.keys(parsed.data) as (keyof typeof LABELS)[];
  const pick = (o: Record<string, unknown>) => Object.fromEntries(keys.map((k) => [LABELS[k], o[k]]));
  await recordActivity(user, {
    action: "updated",
    area: "registrations",
    target: `${doc.regId} · ${"teamName" in doc ? doc.teamName : doc.name}`,
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
  const res = modelFor(req) === "hackathon" ? await HackathonRegistration.deleteOne({ _id: id }) : await Registration.deleteOne({ _id: id });
  return res.deletedCount ? json({ ok: true }) : error(404, "Not found.");
}
