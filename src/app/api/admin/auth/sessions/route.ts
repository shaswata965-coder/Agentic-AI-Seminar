import type { NextRequest } from "next/server";
import { AdminSession } from "@/lib/models";
import { endSessions, requireAdmin } from "@/lib/server/admin-auth";
import { json } from "@/lib/server/http";

/** The browsers and devices the signed-in user is signed in on (My account). */
export async function GET(req: NextRequest) {
  const me = await requireAdmin(req, { everyone: true });
  if (me instanceof Response) return me;
  const sessions = await AdminSession.find({ userId: me.id, expiresAt: { $gt: new Date() } }).sort({ lastSeenAt: -1 }).limit(20).lean();
  return json({
    data: sessions.map((s) => ({ current: s._id === me.sessionId, userAgent: s.userAgent, createdAt: s.createdAt ?? null, lastSeenAt: s.lastSeenAt, expiresAt: s.expiresAt })),
  });
}

/** Sign out everywhere except this browser. */
export async function DELETE(req: NextRequest) {
  const me = await requireAdmin(req, { everyone: true });
  if (me instanceof Response) return me;
  await endSessions(me.id, me.sessionId);
  return json({ ok: true });
}
