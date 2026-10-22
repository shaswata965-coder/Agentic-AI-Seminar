import type { NextRequest } from "next/server";
import { currentThemeKey, THEME_META } from "@/lib/content/constants";
import { getSavedSettings } from "@/lib/content/queries";
import { ENQUIRY_FORMS, FORM_SETTINGS, FORMS, isBuiltIn, responseRows, storedText, type FormField } from "@/lib/forms";
import { Enquiry, HackathonRegistration, Registration } from "@/lib/models";
import { recordActivity } from "@/lib/server/activity";
import { requireAdmin } from "@/lib/server/admin-auth";
import { toCsv } from "@/lib/server/csv";
import { error } from "@/lib/server/http";

/** A theme's name, from its key (or an earlier key) as stored. */
const themeName = (key: string) => THEME_META[currentThemeKey(key) as keyof typeof THEME_META]?.short ?? key;

type Row = Record<string, unknown> & { answers?: Record<string, unknown> };

const BUILT_IN_LABELS: Record<string, string> = { name: "Name", email: "E-mail", organisation: "Organisation", phone: "Phone", subject: "Subject", message: "Message" };

/** A column for each field of a form now, then for questions deleted since that someone answered. */
function columns(fields: FormField[], rows: Row[]): { key: string; label: string }[] {
  return withEarlier(fields.map((f) => ({ key: f.key, label: f.label })), rows);
}

/** `cols` and a column for each answer to a question not among them (deleted from the form since). */
function withEarlier(cols: { key: string; label: string }[], rows: Row[]) {
  const known = new Set(cols.map((c) => c.key));
  for (const r of rows)
    for (const k of Object.keys(r.answers ?? {})) {
      if (known.has(k)) continue;
      known.add(k);
      cols.push({ key: k, label: `Earlier question (${k})` });
    }
  return cols;
}

const TITLES: Record<string, string> = { workshop: "Workshop registrations (CSV)", hackathon: "Hackathon teams (CSV)", enquiries: "Enquiries (CSV)" };

/** CSV downloads: /api/admin/export/workshop | hackathon | enquiries */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/admin/export/[kind]">) {
  const { kind } = await ctx.params;
  const area = kind === "enquiries" ? "enquiries" : "registrations";
  const user = await requireAdmin(req, { permission: area });
  if (user instanceof Response) return user;
  const s = await getSavedSettings();
  let csv: string;
  if (kind === "workshop") {
    const rows = (await Registration.find({}).sort({ createdAt: 1 }).lean()) as unknown as Row[];
    const cols = columns(s.registerFields, rows);
    csv = toCsv(
      ["Registration ID", "Registered at (IST)", "Status", ...cols.map((c) => c.label), "Notes"],
      rows.map((r) => [r.regId, r.createdAt, r.status, ...cols.map((c) => storedText(r, c.key)), r.notes]),
    );
  } else if (kind === "hackathon") {
    const rows = (await HackathonRegistration.find({}).sort({ createdAt: 1 }).lean()) as unknown as (Row & { members: Row[] })[];
    // The hackathon has one track; only teams that registered while it had one per theme picked a theme.
    const themes = rows.some((r) => r.track);
    const cols = columns(s.hackathonFields, rows);
    const member = (m: Row) => {
      const rest = responseRows(m, s.hackathonMemberFields).filter((x) => x.key !== "name" && x.key !== "email" && x.text);
      return `${m.name} <${m.email}>${rest.length ? ` (${rest.map((x) => x.text).join(", ")})` : ""}`;
    };
    csv = toCsv(
      ["Team ID", "Registered at (IST)", "Status", ...cols.map((c) => c.label), ...(themes ? ["Theme"] : []), "Members", "Lead name", "Lead e-mail", "Lead phone", "All members", "Notes"],
      rows.map((r) => [
        r.regId,
        r.createdAt,
        r.status,
        ...cols.map((c) => storedText(r, c.key)),
        ...(themes ? [r.track ? themeName(String(r.track)) : ""] : []),
        r.members.length,
        r.members[0]?.name,
        r.members[0]?.email,
        r.members[0]?.phone,
        r.members.map(member),
        r.notes,
      ]),
    );
  } else if (kind === "enquiries") {
    const rows = (await Enquiry.find({}).sort({ createdAt: 1 }).lean()) as unknown as Row[];
    // The three enquiry forms share their built-in fields; each one's added questions get columns of their own.
    const cols = withEarlier(
      [
        ...["name", "email", "organisation", "phone", "subject", "message"].map((key) => ({ key, label: BUILT_IN_LABELS[key] })),
        ...(["contact", "exhibitor", "sponsor"] as const).flatMap((t) =>
          s[FORM_SETTINGS[ENQUIRY_FORMS[t]]].filter((f) => !isBuiltIn(ENQUIRY_FORMS[t], f.key)).map((f) => ({ key: f.key, label: `${f.label} (${FORMS[ENQUIRY_FORMS[t]].title})` })),
        ),
      ],
      rows,
    );
    csv = toCsv(["Received at (IST)", "Type", "Status", ...cols.map((c) => c.label), "Notes"], rows.map((r) => [r.createdAt, r.type, r.status, ...cols.map((c) => storedText(r, c.key)), r.notes]));
  } else {
    return error(404, "Unknown export.");
  }
  await recordActivity(user, { action: "downloaded", area, target: TITLES[kind] });
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="aaiw-${kind}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
