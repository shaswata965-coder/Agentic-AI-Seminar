import { draftMode } from "next/headers";
import type { NextRequest } from "next/server";
import { SETTINGS_DRAFT_KEY } from "@/lib/content/queries";
import { connectDb } from "@/lib/db";
import { Singleton } from "@/lib/models";
import { BASE_PATH } from "@/lib/paths";
import { previewSchema } from "@/lib/schema/field-validation";
import { flattenFields, SETTINGS_DEF } from "@/lib/schema/resources";
import { requireAdmin } from "@/lib/server/admin-auth";
import { error, json, readJson } from "@/lib/server/http";

/*
 * The live preview in Admin → Site settings. The editor stores its unsaved
 * draft here and shows the real page in a frame with Next.js Draft Mode on, so
 * getSettings() returns the draft for this browser only. Visitors keep the
 * cached, saved pages. There is one draft at a time: two people editing at
 * once see each other's unsaved changes in their previews.
 */

const isSitePath = (path: string) => /^\/(?!\/)/.test(path) && !/^\/(admin|api|_next)(\/|$|\?)/.test(path);

/** Open a page of the site in the preview frame: ?path=/about */
export async function GET(req: NextRequest) {
  const user = await requireAdmin(req, { permission: "settings" });
  if (user instanceof Response) return user;
  const path = req.nextUrl.searchParams.get("path") ?? "/";
  if (!isSitePath(path)) return error(400, "Not a page of the site.");
  (await draftMode()).enable();
  return new Response(null, { status: 307, headers: { Location: `${BASE_PATH}${path}`, "Cache-Control": "no-store" } });
}

/** Store the draft being edited and keep Draft Mode on for this browser. */
export async function POST(req: NextRequest) {
  const user = await requireAdmin(req, { permission: "settings" });
  if (user instanceof Response) return user;
  const parsed = previewSchema(flattenFields(SETTINGS_DEF.sections)).safeParse(await readJson(req, 1024 * 1024));
  if (!parsed.success) return error(422, "These changes can't be previewed.");
  await connectDb();
  await Singleton.findOneAndUpdate({ key: SETTINGS_DRAFT_KEY }, { $set: { data: parsed.data } }, { upsert: true });
  (await draftMode()).enable();
  return json({ ok: true });
}

/** Leave the preview: forget the draft and turn Draft Mode off. */
export async function DELETE(req: NextRequest) {
  const user = await requireAdmin(req, { permission: "settings" });
  if (user instanceof Response) return user;
  await connectDb();
  await Singleton.deleteOne({ key: SETTINGS_DRAFT_KEY });
  (await draftMode()).disable();
  return json({ ok: true });
}
