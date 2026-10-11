import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { collectionDef, createItem, listItems, ValidationError } from "@/lib/server/admin-crud";
import { error, json, readJson } from "@/lib/server/http";

export async function GET(req: NextRequest, ctx: RouteContext<"/api/admin/content/[resource]">) {
  const user = await requireAdmin(req);
  if (user instanceof Response) return user;
  const def = collectionDef((await ctx.params).resource);
  if (!def) return error(404, "Unknown content type.");
  return json({ data: await listItems(def) });
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/admin/content/[resource]">) {
  const user = await requireAdmin(req);
  if (user instanceof Response) return user;
  const def = collectionDef((await ctx.params).resource);
  if (!def) return error(404, "Unknown content type.");
  try {
    return json({ data: await createItem(def, await readJson(req, 512 * 1024)) }, { status: 201 });
  } catch (err) {
    if (err instanceof ValidationError) return error(422, "Please fix the highlighted fields.", { fieldErrors: err.fieldErrors });
    console.error("[admin/content POST]", err);
    return error(500, "Could not save.");
  }
}
