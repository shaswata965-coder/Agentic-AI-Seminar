import type { NextRequest } from "next/server";
import { AUTH_COOKIE, verifySession } from "@/lib/auth-token";
import { connectDb } from "@/lib/db";
import { AdminSession } from "@/lib/models";
import { clearedSessionCookie } from "@/lib/server/admin-auth";
import { error, isSameOrigin, json } from "@/lib/server/http";

/** Sign out: end this browser's session in the database (so a copy of the cookie stops working too) and clear the cookie. */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return error(403, "Cross-site request blocked.");
  const claims = await verifySession(req.cookies.get(AUTH_COOKIE)?.value);
  if (claims) {
    try {
      await connectDb();
      await AdminSession.deleteOne({ _id: String(claims.sid), userId: claims.sub });
    } catch (err) {
      console.error("[admin/logout] Could not end the session", err);
    }
  }
  const res = json({ ok: true });
  res.cookies.set(clearedSessionCookie());
  return res;
}
