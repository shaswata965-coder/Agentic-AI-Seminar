import type { NextRequest } from "next/server";
import { contentPermission, contentReaders } from "@/lib/permissions";
import { contentTitle, recordActivity } from "@/lib/server/activity";
import { requireAdmin } from "@/lib/server/admin-auth";
import { collectionDef, createItem, listItems, ValidationError } from "@/lib/server/admin-crud";
import { error, json, readJson } from "@/lib/server/http";

export async function GET(req: NextRequest, ctx: RouteContext<"/api/admin/content/[resource]">) {
  const { resource } = await ctx.params;
  const user = await requireAdmin(req, { permission: contentReaders(resource) });
  if (user instanceof Response) return user;
  const def = collectionDef(resource);
  if (!def) return error(404, "Unknown content type.");
  return json({ data: await listItems(def) });
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/admin/content/[resource]">) {
  const { resource } = await ctx.params;
  const user = await requireAdmin(req, { permission: contentPermission(resource) });
  if (user instanceof Response) return user;
  const def = collectionDef(resource);
  if (!def) return error(404, "Unknown content type.");
  try {
    const item = await createItem(def, await readJson(req, 512 * 1024));
    await recordActivity(user, { action: "created", area: contentPermission(def.key), target: contentTitle(def, item), targetId: String(item.id), diff: { fields: def.fields, before: null, after: item } });
    return json({ data: item }, { status: 201 });
  } catch (err) {
    if (err instanceof ValidationError) return error(422, "Please fix the highlighted fields.", { fieldErrors: err.fieldErrors });
    console.error("[admin/content POST]", err);
    return error(500, "Could not save.");
  }
}
