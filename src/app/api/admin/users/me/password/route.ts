import type { NextRequest } from "next/server";
import { z } from "zod";
import { User } from "@/lib/models";
import { recordActivity } from "@/lib/server/activity";
import { hashPassword, PASSWORD_MIN, requireAdmin, verifyPassword } from "@/lib/server/admin-auth";
import { error, json, readJson, zodFieldErrors } from "@/lib/server/http";

const schema = z.object({ current: z.string().max(200), next: z.string().min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`).max(200) });

/** Any signed-in user can change their own password. */
export async function POST(req: NextRequest) {
  const me = await requireAdmin(req, { everyone: true });
  if (me instanceof Response) return me;
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return error(422, "Please fix the highlighted fields.", { fieldErrors: zodFieldErrors(parsed.error) });
  const u = await User.findById(me.id);
  if (!u || !(await verifyPassword(parsed.data.current, u.passwordHash))) return error(400, "Your current password is incorrect.", { fieldErrors: { current: "Incorrect password" } });
  u.passwordHash = await hashPassword(parsed.data.next);
  await u.save();
  await recordActivity(me, { action: "changed-password", area: "account" });
  return json({ ok: true });
}
