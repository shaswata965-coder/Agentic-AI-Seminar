import type { NextRequest } from "next/server";
import { z } from "zod";
import { User } from "@/lib/models";
import { endSessions, hashPassword, newPassword, requireAdmin, signsOut } from "@/lib/server/admin-auth";
import { error, json, readJson, zodFieldErrors } from "@/lib/server/http";

type Ctx = RouteContext<"/api/admin/users/[id]">;

// The id as stored (lower-case hex), so "the same account" can't be dodged with another spelling of it.
const idFrom = (raw: string) => (/^[a-f0-9]{24}$/i.test(raw) ? raw.toLowerCase() : null);

/** Whether some active administrator other than `id` remains. */
const otherAdmin = async (id: string) => Boolean(await User.exists({ _id: { $ne: id }, role: "admin", active: true }));
const patch = z.object({
  name: z.string().trim().max(120).optional(),
  role: z.enum(["admin", "editor"]).optional(),
  active: z.boolean().optional(),
  password: newPassword.optional(),
});

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const me = await requireAdmin(req, { role: "admin" });
  if (me instanceof Response) return me;
  const id = idFrom((await ctx.params).id);
  if (!id) return error(404, "Not found.");
  const parsed = patch.safeParse(await readJson(req));
  if (!parsed.success) return error(422, "Please fix the highlighted fields.", { fieldErrors: zodFieldErrors(parsed.error) });
  const demotes = parsed.data.role === "editor" || parsed.data.active === false;
  if (id === me.id && demotes) return error(400, "You can't remove your own admin access.");
  if (demotes && !(await otherAdmin(id))) return error(400, "There must always be at least one active administrator.");
  const { password, ...rest } = parsed.data;
  const update: Record<string, unknown> = { ...rest };
  if (password) update.passwordHash = await hashPassword(password);
  const u = await User.findOneAndUpdate({ _id: id, role: { $ne: "volunteer" } }, { $set: update }, { returnDocument: "after" }).lean();
  if (!u) return error(404, "Not found.");
  // A new password or a disabled account signs them out everywhere (but not the admin changing their own password here).
  if (signsOut(update)) await endSessions(id, id === me.id ? me.sessionId : undefined);
  return json({ ok: true });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const me = await requireAdmin(req, { role: "admin" });
  if (me instanceof Response) return me;
  const id = idFrom((await ctx.params).id);
  if (!id) return error(404, "Not found.");
  if (id === me.id) return error(400, "You can't delete your own account.");
  if (!(await otherAdmin(id))) return error(400, "There must always be at least one active administrator.");
  const res = await User.deleteOne({ _id: id, role: { $ne: "volunteer" } });
  if (!res.deletedCount) return error(404, "Not found.");
  await endSessions(id);
  return json({ ok: true });
}
