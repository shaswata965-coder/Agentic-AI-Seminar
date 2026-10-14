import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { mediaBucket } from "@/lib/models";
import { can } from "@/lib/permissions";
import { isTracked, recordActivity } from "@/lib/server/activity";
import { requireAdmin } from "@/lib/server/admin-auth";
import { error, json } from "@/lib/server/http";

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/admin/media/[id]">) {
  const user = await requireAdmin(req, { permission: "media" });
  if (user instanceof Response) return user;
  if (!can(user, "delete")) return error(403, "Your volunteer account can't delete files. Ask an administrator.");
  const { id } = await ctx.params;
  if (!/^[a-f0-9]{24}$/i.test(id)) return error(404, "Not found.");
  const _id = new mongoose.Types.ObjectId(id);
  const file = isTracked(user) ? (await mediaBucket().find({ _id }).limit(1).toArray())[0] : null;
  try {
    await mediaBucket().delete(_id);
  } catch {
    return error(404, "Not found.");
  }
  await recordActivity(user, { action: "deleted", area: "media", target: file?.filename ?? id, targetId: id });
  return json({ ok: true });
}
