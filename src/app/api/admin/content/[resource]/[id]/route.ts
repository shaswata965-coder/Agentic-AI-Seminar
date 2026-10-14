import type { NextRequest } from "next/server";
import { can, contentPermission, contentReaders } from "@/lib/permissions";
import { contentTitle, isTracked, recordActivity } from "@/lib/server/activity";
import { requireAdmin } from "@/lib/server/admin-auth";
import { collectionDef, deleteItem, getItem, updateItem, ValidationError } from "@/lib/server/admin-crud";
import { error, json, readJson } from "@/lib/server/http";

type Ctx = RouteContext<"/api/admin/content/[resource]/[id]">;

export async function GET(req: NextRequest, ctx: Ctx) {
  const { resource, id } = await ctx.params;
  const user = await requireAdmin(req, { permission: contentReaders(resource) });
  if (user instanceof Response) return user;
  const def = collectionDef(resource);
  if (!def) return error(404, "Unknown content type.");
  const item = await getItem(def, id);
  return item ? json({ data: item }) : error(404, "Not found.");
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { resource, id } = await ctx.params;
  const user = await requireAdmin(req, { permission: contentPermission(resource) });
  if (user instanceof Response) return user;
  const def = collectionDef(resource);
  if (!def) return error(404, "Unknown content type.");
  try {
    const before = isTracked(user) ? await getItem(def, id) : null;
    const item = await updateItem(def, id, await readJson(req, 512 * 1024));
    if (!item) return error(404, "Not found.");
    await recordActivity(user, { action: "updated", area: contentPermission(def.key), target: contentTitle(def, item), targetId: id, diff: { fields: def.fields, before, after: item } });
    return json({ data: item });
  } catch (err) {
    if (err instanceof ValidationError) return error(422, "Please fix the highlighted fields.", { fieldErrors: err.fieldErrors });
    console.error("[admin/content PUT]", err);
    return error(500, "Could not save.");
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { resource, id } = await ctx.params;
  const user = await requireAdmin(req, { permission: contentPermission(resource) });
  if (user instanceof Response) return user;
  if (!can(user, "delete")) return error(403, "Your volunteer account can't delete items. Hide it instead, or ask an administrator.");
  const def = collectionDef(resource);
  if (!def) return error(404, "Unknown content type.");
  const before = isTracked(user) ? await getItem(def, id) : null;
  if (!(await deleteItem(def, id))) return error(404, "Not found.");
  await recordActivity(user, { action: "deleted", area: contentPermission(def.key), target: before ? contentTitle(def, before) : id, targetId: id, diff: { fields: def.fields, before, after: null } });
  return json({ ok: true });
}
