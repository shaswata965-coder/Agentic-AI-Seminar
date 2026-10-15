import type { NextRequest } from "next/server";
import { z } from "zod";
import { User } from "@/lib/models";
import { recordActivity } from "@/lib/server/activity";
import { endSessions, hashPassword, newPassword, requireAdmin, verifyPassword } from "@/lib/server/admin-auth";
import { error, json, readJson, zodFieldErrors } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";

const schema = z.object({ current: z.string().max(200), next: newPassword });

/** Any signed-in user can change their own password. Their other sessions (other browsers and devices) are signed out. */
export async function POST(req: NextRequest) {
  const me = await requireAdmin(req, { everyone: true });
  if (me instanceof Response) return me;
  if (!rateLimit(`password:${me.id}`, 10, 15 * 60_000).ok) return error(429, "Too many attempts. Please wait 15 minutes.");
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return error(422, "Please fix the highlighted fields.", { fieldErrors: zodFieldErrors(parsed.error) });
  const u = await User.findById(me.id);
  if (!u || !(await verifyPassword(parsed.data.current, u.passwordHash))) return error(400, "Your current password is incorrect.", { fieldErrors: { current: "Incorrect password" } });
  if (parsed.data.next === parsed.data.current) return error(422, "Please fix the highlighted fields.", { fieldErrors: { next: "Choose a password different from the current one." } });
  u.passwordHash = await hashPassword(parsed.data.next);
  await u.save();
  await endSessions(me.id, me.sessionId);
  await recordActivity(me, { action: "changed-password", area: "account" });
  return json({ ok: true });
}
