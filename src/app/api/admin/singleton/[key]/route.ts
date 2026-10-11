import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { getSingleton, isSingletonKey, saveSingleton, ValidationError } from "@/lib/server/admin-crud";
import { error, json, readJson } from "@/lib/server/http";

export async function GET(req: NextRequest, ctx: RouteContext<"/api/admin/singleton/[key]">) {
  const user = await requireAdmin(req);
  if (user instanceof Response) return user;
  const { key } = await ctx.params;
  if (!isSingletonKey(key)) return error(404, "Unknown settings group.");
  return json({ data: await getSingleton(key) });
}

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/admin/singleton/[key]">) {
  const user = await requireAdmin(req);
  if (user instanceof Response) return user;
  const { key } = await ctx.params;
  if (!isSingletonKey(key)) return error(404, "Unknown settings group.");
  try {
    return json({ data: await saveSingleton(key, await readJson(req, 1024 * 1024)) });
  } catch (err) {
    if (err instanceof ValidationError) return error(422, "Please fix the highlighted fields.", { fieldErrors: err.fieldErrors });
    console.error("[admin/singleton PUT]", err);
    return error(500, "Could not save settings.");
  }
}
