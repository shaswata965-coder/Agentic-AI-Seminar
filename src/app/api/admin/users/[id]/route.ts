import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { User } from "@/lib/models";
import { hashPassword, PASSWORD_MIN, requireAdmin } from "@/lib/server/admin-auth";
import { error, json, readJson, zodFieldErrors } from "@/lib/server/http";

type Ctx = RouteContext<"/api/admin/users/[id]">;
const patch = z.object({
  name: z.string().trim().max(120).optional(),
  role: z.enum(["admin", "editor"]).optional(),
  active: z.boolean().optional(),
  password: z.string().min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`).max(200).optional(),
});

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const me = await requireAdmin(req, { role: "admin" });
  if (me instanceof Response) return me;
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) return error(404, "Not found.");
  const parsed = patch.safeParse(await readJson(req));
  if (!parsed.success) return error(422, "Please fix the highlighted fields.", { fieldErrors: zodFieldErrors(parsed.error) });
  if (id === me.id && (parsed.data.role === "editor" || parsed.data.active === false)) return error(400, "You can't remove your own admin access.");
  const { password, ...rest } = parsed.data;
  const update: Record<string, unknown> = { ...rest };
  if (password) update.passwordHash = await hashPassword(password);
  const u = await User.findOneAndUpdate({ _id: id, role: { $ne: "volunteer" } }, { $set: update }, { returnDocument: "after" }).lean();
  return u ? json({ ok: true }) : error(404, "Not found.");
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const me = await requireAdmin(req, { role: "admin" });
  if (me instanceof Response) return me;
  const { id } = await ctx.params;
  if (id === me.id) return error(400, "You can't delete your own account.");
  if (!mongoose.isValidObjectId(id)) return error(404, "Not found.");
  const res = await User.deleteOne({ _id: id, role: { $ne: "volunteer" } });
  return res.deletedCount ? json({ ok: true }) : error(404, "Not found.");
}
