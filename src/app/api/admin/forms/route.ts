import type { NextRequest } from "next/server";
import { getSavedSettings } from "@/lib/content/queries";
import { FORM_SETTINGS, type FormField, type FormKey } from "@/lib/forms";
import { requireAdmin } from "@/lib/server/admin-auth";
import { json } from "@/lib/server/http";

/** Each public form's fields as saved (Site settings), so registrations and enquiries can be shown by their questions. */
export async function GET(req: NextRequest) {
  const user = await requireAdmin(req, { permission: ["registrations", "enquiries"] });
  if (user instanceof Response) return user;
  const s = await getSavedSettings();
  const forms = Object.fromEntries((Object.keys(FORM_SETTINGS) as FormKey[]).map((form) => [form, s[FORM_SETTINGS[form]]])) as Record<FormKey, FormField[]>;
  return json({ data: forms });
}
