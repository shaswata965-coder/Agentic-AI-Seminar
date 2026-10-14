import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { isDuplicateKeyError } from "@/lib/db";
import { User } from "@/lib/models";
import { hashPassword, requireAdmin } from "@/lib/server/admin-auth";
import { error, json, readJson, zodFieldErrors } from "@/lib/server/http";
import { volunteerFields } from "@/lib/server/volunteers";

type Ctx = RouteContext<"/api/admin/volunteers/[id]">;
const patch = z.object({
  email: volunteerFields.email.optional(),
  name: volunteerFields.name.optional(),
  responsibility: volunteerFields.responsibility.optional(),
  permissions: volunteerFields.permissions.optional(),
  active: z.boolean().optional(),
  password: volunteerFields.password.optional(),
});

/** Change a volunteer's details, permissions or password, or disable them. Takes effect on their next request. */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const me = await requireAdmin(req, { role: "admin" });
  if (me instanceof Response) return me;
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) return error(404, "Not found.");
  const parsed = patch.safeParse(await readJson(req));
  if (!parsed.success) return error(422, "Please fix the highlighted fields.", { fieldErrors: zodFieldErrors(parsed.error) });
  const { password, ...rest } = parsed.data;
  const update: Record<string, unknown> = { ...rest };
  if (password) update.passwordHash = await hashPassword(password);
  try {
    const u = await User.findOneAndUpdate({ _id: id, role: "volunteer" }, { $set: update }, { returnDocument: "after" }).lean();
    return u ? json({ ok: true }) : error(404, "Not found.");
  } catch (err) {
    if (isDuplicateKeyError(err)) return error(409, "Someone with this e-mail can already sign in.", { fieldErrors: { email: "Already in use" } });
    throw err;
  }
}

/** Remove a volunteer's account. Their entries stay in the task tracker. */
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const me = await requireAdmin(req, { role: "admin" });
  if (me instanceof Response) return me;
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) return error(404, "Not found.");
  const res = await User.deleteOne({ _id: id, role: "volunteer" });
  return res.deletedCount ? json({ ok: true }) : error(404, "Not found.");
}
