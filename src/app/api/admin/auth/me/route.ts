import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { json } from "@/lib/server/http";

/** The signed-in user, for the admin panel (without the session's id, which the page has no use for). */
export async function GET(req: NextRequest) {
  const user = await requireAdmin(req, { everyone: true });
  if (user instanceof Response) return user;
  const { sessionId: _, ...me } = user;
  return json({ data: me });
}
