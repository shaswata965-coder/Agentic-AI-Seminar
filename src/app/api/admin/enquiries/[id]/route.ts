import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { Enquiry } from "@/lib/models";
import { requireAdmin } from "@/lib/server/admin-auth";
import { error, json, readJson } from "@/lib/server/http";

type Ctx = RouteContext<"/api/admin/enquiries/[id]">;

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await requireAdmin(req);
  if (user instanceof Response) return user;
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) return error(404, "Not found.");
  const parsed = z.object({ status: z.enum(["new", "in-progress", "closed"]).optional(), notes: z.string().max(5000).optional() }).safeParse(await readJson(req));
  if (!parsed.success) return error(400, "Invalid update.");
  const doc = await Enquiry.findByIdAndUpdate(id, { $set: parsed.data }, { returnDocument: "after" }).lean();
  return doc ? json({ ok: true }) : error(404, "Not found.");
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const user = await requireAdmin(req, { role: "admin" });
  if (user instanceof Response) return user;
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) return error(404, "Not found.");
  const res = await Enquiry.deleteOne({ _id: id });
  return res.deletedCount ? json({ ok: true }) : error(404, "Not found.");
}
