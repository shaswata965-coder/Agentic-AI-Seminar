import { draftMode } from "next/headers";
import type { NextRequest } from "next/server";
import { SETTINGS_DRAFT_KEY } from "@/lib/content/queries";
import { connectDb } from "@/lib/db";
import { Singleton } from "@/lib/models";
import { BASE_PATH } from "@/lib/paths";
import { SETTINGS_PERMISSIONS } from "@/lib/permissions";
import { previewSchema } from "@/lib/schema/field-validation";
import { flattenFields, SETTINGS_DEF } from "@/lib/schema/resources";
import { requireAdmin } from "@/lib/server/admin-auth";
import { getSingleton } from "@/lib/server/admin-crud";
import { error, isRecord, isSameOrigin, json, readJson } from "@/lib/server/http";
import { scopedSettings } from "@/lib/server/settings-access";

/*
 * The live preview in Admin → Site settings. The editor stores its unsaved
 * draft here and shows the real page in a frame with Next.js Draft Mode on, so
 * getSettings() returns the draft for this browser only. Visitors keep the
 * cached, saved pages. There is one draft at a time: two people editing at
 * once see each other's unsaved changes in their previews.
 */

// A path on this site (not another host, not the admin panel or the API), without anything that could end the header.
const isSitePath = (path: string) => path.length <= 300 && /^\/(?![/\\])[\w\-./~%?=&]*$/.test(path) && !/^\/(admin|api|_next)(\/|$|\?)/.test(path);

/** Open a page of the site in the preview frame: ?path=/about */
export async function GET(req: NextRequest) {
  // Opened by the admin's own pages (the frame, "open in a new tab"), never by a link on another site.
  if (!isSameOrigin(req)) return error(403, "Cross-site request blocked.");
  const user = await requireAdmin(req, { permission: SETTINGS_PERMISSIONS });
  if (user instanceof Response) return user;
  const path = req.nextUrl.searchParams.get("path") ?? "/";
  if (!isSitePath(path)) return error(400, "Not a page of the site.");
  (await draftMode()).enable();
  return new Response(null, { status: 307, headers: { Location: `${BASE_PATH}${path}`, "Cache-Control": "no-store" } });
}

/** Store the draft being edited and keep Draft Mode on for this browser. A volunteer's draft changes only their pages. */
export async function POST(req: NextRequest) {
  const user = await requireAdmin(req, { permission: SETTINGS_PERMISSIONS });
  if (user instanceof Response) return user;
  const input = await readJson(req, 1024 * 1024);
  if (!isRecord(input)) return error(400, "Send the draft as a JSON object of at most 1 MB.");
  const parsed = previewSchema(flattenFields(SETTINGS_DEF.sections)).safeParse(scopedSettings(user, (await getSingleton("settings")).data, input));
  if (!parsed.success) return error(422, "These changes can't be previewed.");
  await connectDb();
  await Singleton.findOneAndUpdate({ key: SETTINGS_DRAFT_KEY }, { $set: { data: parsed.data } }, { upsert: true });
  (await draftMode()).enable();
  return json({ ok: true });
}

/**
 * Leave the preview: forget the draft and turn Draft Mode off. With ?keep=1 (after a save or a discard, while
 * the editor stays open) only the draft goes, so the preview shows the saved settings and Draft Mode stays on
 * for the next change: turning it off and on again between two changes let the frame's re-render go out
 * without the cookie and show the saved page instead of the new draft.
 */
export async function DELETE(req: NextRequest) {
  const user = await requireAdmin(req, { permission: SETTINGS_PERMISSIONS });
  if (user instanceof Response) return user;
  await connectDb();
  await Singleton.deleteOne({ key: SETTINGS_DRAFT_KEY });
  if (req.nextUrl.searchParams.get("keep") !== "1") (await draftMode()).disable();
  return json({ ok: true });
}
