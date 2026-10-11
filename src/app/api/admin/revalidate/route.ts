import type { NextRequest } from "next/server";
import { CONTENT_TAG } from "@/lib/content/queries";
import { requireAdmin } from "@/lib/server/admin-auth";
import { json } from "@/lib/server/http";
import { expireTags } from "@/lib/server/revalidate";

/**
 * "Refresh website": expire every cached page and query so the next visitor
 * sees what is in the database. Useful after a deployment (images built
 * without database access start with the default content) or after scripts.
 */
export async function POST(req: NextRequest) {
  const user = await requireAdmin(req);
  if (user instanceof Response) return user;
  expireTags([CONTENT_TAG]);
  return json({ ok: true });
}
