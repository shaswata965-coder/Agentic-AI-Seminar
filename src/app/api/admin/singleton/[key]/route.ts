import type { NextRequest } from "next/server";
import { SETTINGS_PERMISSIONS, type Permission } from "@/lib/permissions";
import { flattenFields, SINGLETONS } from "@/lib/schema/resources";
import { isTracked, recordActivity } from "@/lib/server/activity";
import { requireAdmin } from "@/lib/server/admin-auth";
import { getSingleton, isSingletonKey, saveSingleton, ValidationError, type SingletonKey } from "@/lib/server/admin-crud";
import { error, isRecord, json, readJson } from "@/lib/server/http";
import { changedPages, scopedSettings, visibleSettings } from "@/lib/server/settings-access";

// Site settings: any of its pages (each route then limits a volunteer to theirs). The hackathon: its own permission.
const access = (key: SingletonKey): Permission | Permission[] => (key === "settings" ? SETTINGS_PERMISSIONS : key);

export async function GET(req: NextRequest, ctx: RouteContext<"/api/admin/singleton/[key]">) {
  const { key } = await ctx.params;
  if (!isSingletonKey(key)) return error(404, "Unknown settings group.");
  const user = await requireAdmin(req, { permission: access(key) });
  if (user instanceof Response) return user;
  const saved = await getSingleton(key);
  return json({ data: key === "settings" ? { ...saved, data: visibleSettings(user, saved.data) } : saved });
}

export async function PUT(req: NextRequest, ctx: RouteContext<"/api/admin/singleton/[key]">) {
  const { key } = await ctx.params;
  if (!isSingletonKey(key)) return error(404, "Unknown settings group.");
  const user = await requireAdmin(req, { permission: access(key) });
  if (user instanceof Response) return user;
  try {
    const input = await readJson(req, 1024 * 1024);
    if (!isRecord(input)) return error(400, "Send the settings as a JSON object of at most 1 MB.");
    const before = key === "settings" || isTracked(user) ? (await getSingleton(key)).data : null;
    // A volunteer's save changes only the pages of Site settings they look after.
    const saved = await saveSingleton(key, key === "settings" ? scopedSettings(user, before!, input) : input);
    const def = SINGLETONS[key];
    const pages = key === "settings" ? changedPages(before, saved.data) : [];
    await recordActivity(user, {
      action: "updated",
      area: key,
      target: pages.length ? `${def.label} › ${pages.join(", ")}` : def.label,
      diff: { fields: flattenFields(def.sections), before, after: saved.data },
    });
    return json({ data: key === "settings" ? { ...saved, data: visibleSettings(user, saved.data) } : saved });
  } catch (err) {
    if (err instanceof ValidationError) return error(422, "Please fix the highlighted fields.", { fieldErrors: err.fieldErrors });
    console.error("[admin/singleton PUT]", err);
    return error(500, "Could not save settings.");
  }
}
