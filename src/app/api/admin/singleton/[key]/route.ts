import type { NextRequest } from "next/server";
import { flattenFields, SINGLETONS } from "@/lib/schema/resources";
import { isTracked, recordActivity } from "@/lib/server/activity";
import { requireAdmin } from "@/lib/server/admin-auth";
import { getSingleton, isSingletonKey, saveSingleton, ValidationError } from "@/lib/server/admin-crud";
import { error, json, readJson } from "@/lib/server/http";

export async function GET(req: NextRequest, ctx: RouteContext<"/api/admin/singleton/[key]">) {
  const { key } = await ctx.params;
  if (!isSingletonKey(key)) return error(404, "Unknown settings group.");
  const user = await requireAdmin(req, { permission: key });
  if (user instanceof Response) return user;
  return json({ data: await getSingleton(key) });
}

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/admin/singleton/[key]">) {
  const { key } = await ctx.params;
  if (!isSingletonKey(key)) return error(404, "Unknown settings group.");
  const user = await requireAdmin(req, { permission: key });
  if (user instanceof Response) return user;
  try {
    const before = isTracked(user) ? (await getSingleton(key)).data : null;
    const saved = await saveSingleton(key, await readJson(req, 1024 * 1024));
    const def = SINGLETONS[key];
    await recordActivity(user, { action: "updated", area: key, target: def.label, diff: { fields: flattenFields(def.sections), before, after: saved.data } });
    return json({ data: saved });
  } catch (err) {
    if (err instanceof ValidationError) return error(422, "Please fix the highlighted fields.", { fieldErrors: err.fieldErrors });
    console.error("[admin/singleton PUT]", err);
    return error(500, "Could not save settings.");
  }
}
