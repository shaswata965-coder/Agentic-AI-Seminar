import type { NextRequest } from "next/server";
import { z } from "zod";
import { contentPermission } from "@/lib/permissions";
import { contentTitle, describeOrder, isTracked, recordActivity } from "@/lib/server/activity";
import { requireAdmin } from "@/lib/server/admin-auth";
import { collectionDef, listItems, reorderItems } from "@/lib/server/admin-crud";
import { error, json, readJson } from "@/lib/server/http";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/admin/content/[resource]/reorder">) {
  const { resource } = await ctx.params;
  const user = await requireAdmin(req, { permission: contentPermission(resource) });
  if (user instanceof Response) return user;
  const def = collectionDef(resource);
  if (!def) return error(404, "Unknown content type.");
  const parsed = z.object({ ids: z.array(z.string()).max(1000) }).safeParse(await readJson(req));
  if (!parsed.success) return error(400, "Invalid order.");
  const order = async () => (await listItems(def)).map((it) => ({ id: String(it.id), title: contentTitle(def, it) }));
  const before = isTracked(user) ? await order() : [];
  await reorderItems(def, parsed.data.ids);
  if (isTracked(user)) await recordActivity(user, { action: "reordered", area: contentPermission(def.key), target: def.label, changes: describeOrder(before, await order()) });
  return json({ ok: true });
}
