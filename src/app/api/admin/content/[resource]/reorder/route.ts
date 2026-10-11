import type { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/server/admin-auth";
import { collectionDef, reorderItems } from "@/lib/server/admin-crud";
import { error, json, readJson } from "@/lib/server/http";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/admin/content/[resource]/reorder">) {
  const user = await requireAdmin(req);
  if (user instanceof Response) return user;
  const def = collectionDef((await ctx.params).resource);
  if (!def) return error(404, "Unknown content type.");
  const parsed = z.object({ ids: z.array(z.string()).max(1000) }).safeParse(await readJson(req));
  if (!parsed.success) return error(400, "Invalid order.");
  await reorderItems(def, parsed.data.ids);
  return json({ ok: true });
}
