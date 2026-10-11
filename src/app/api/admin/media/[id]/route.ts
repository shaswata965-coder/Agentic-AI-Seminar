import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { mediaBucket } from "@/lib/models";
import { requireAdmin } from "@/lib/server/admin-auth";
import { error, json } from "@/lib/server/http";

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/admin/media/[id]">) {
  const user = await requireAdmin(req);
  if (user instanceof Response) return user;
  const { id } = await ctx.params;
  if (!/^[a-f0-9]{24}$/i.test(id)) return error(404, "Not found.");
  try {
    await mediaBucket().delete(new mongoose.Types.ObjectId(id));
    return json({ ok: true });
  } catch {
    return error(404, "Not found.");
  }
}
