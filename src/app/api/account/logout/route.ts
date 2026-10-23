import type { NextRequest } from "next/server";
import { error, isSameOrigin, json } from "@/lib/server/http";
import { clearedVisitorCookie, endVisitorSession, getVisitor } from "@/lib/server/visitor-auth";

/** Sign out on the public site: the session ends here and in this browser. */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return error(403, "Cross-site request blocked.");
  try {
    const v = await getVisitor(req);
    if (v) await endVisitorSession(v.sessionId);
  } catch {}
  const res = json({ data: { ok: true } });
  res.cookies.set(clearedVisitorCookie());
  return res;
}
