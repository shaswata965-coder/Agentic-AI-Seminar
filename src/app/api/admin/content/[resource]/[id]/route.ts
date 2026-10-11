import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { collectionDef, deleteItem, getItem, updateItem, ValidationError } from "@/lib/server/admin-crud";
import { error, json, readJson } from "@/lib/server/http";

type Ctx = RouteContext<"/api/admin/content/[resource]/[id]">;

export async function GET(req: NextRequest, ctx: Ctx) {
  const user = await requireAdmin(req);
  if (user instanceof Response) return user;
  const { resource, id } = await ctx.params;
  const def = collectionDef(resource);
  if (!def) return error(404, "Unknown content type.");
  const item = await getItem(def, id);
  return item ? json({ data: item }) : error(404, "Not found.");
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const user = await requireAdmin(req);
  if (user instanceof Response) return user;
  const { resource, id } = await ctx.params;
  const def = collectionDef(resource);
  if (!def) return error(404, "Unknown content type.");
  try {
    const item = await updateItem(def, id, await readJson(req, 512 * 1024));
    return item ? json({ data: item }) : error(404, "Not found.");
  } catch (err) {
    if (err instanceof ValidationError) return error(422, "Please fix the highlighted fields.", { fieldErrors: err.fieldErrors });
    console.error("[admin/content PUT]", err);
    return error(500, "Could not save.");
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const user = await requireAdmin(req);
  if (user instanceof Response) return user;
  const { resource, id } = await ctx.params;
  const def = collectionDef(resource);
  if (!def) return error(404, "Unknown content type.");
  return (await deleteItem(def, id)) ? json({ ok: true }) : error(404, "Not found.");
}
