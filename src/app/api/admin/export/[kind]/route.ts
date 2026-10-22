import type { NextRequest } from "next/server";
import { currentThemeKey, THEME_META } from "@/lib/content/constants";
import { Enquiry, HackathonRegistration, Registration } from "@/lib/models";
import { recordActivity } from "@/lib/server/activity";
import { requireAdmin } from "@/lib/server/admin-auth";
import { toCsv } from "@/lib/server/csv";
import { error } from "@/lib/server/http";

/** A theme's name, from its key (or an earlier key) as stored. */
const themeName = (key: string) => THEME_META[currentThemeKey(key) as keyof typeof THEME_META]?.short ?? key;

const TITLES: Record<string, string> = { workshop: "Workshop registrations (CSV)", hackathon: "Hackathon teams (CSV)", enquiries: "Enquiries (CSV)" };

/** CSV downloads: /api/admin/export/workshop | hackathon | enquiries */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/admin/export/[kind]">) {
  const { kind } = await ctx.params;
  const area = kind === "enquiries" ? "enquiries" : "registrations";
  const user = await requireAdmin(req, { permission: area });
  if (user instanceof Response) return user;
  let csv: string;
  if (kind === "workshop") {
    const rows = await Registration.find({}).sort({ createdAt: 1 }).lean();
    csv = toCsv(
      ["Registration ID", "Registered at (IST)", "Status", "Name", "E-mail", "Phone", "Category", "Organisation", "Designation", "City", "Country", "Interests", "Tutorials", "Hackathon interest", "Dietary", "Accessibility", "Heard from", "Message", "Notes"],
      rows.map((r) => [r.regId, r.createdAt, r.status, r.name, r.email, r.phone, r.category, r.organisation, r.designation, r.city, r.country, r.interests.map(themeName), r.tutorials ? "yes" : "no", r.hackathonInterest ? "yes" : "no", r.dietary, r.accessibility, r.heardFrom, r.message, r.notes]),
    );
  } else if (kind === "hackathon") {
    const rows = await HackathonRegistration.find({}).sort({ createdAt: 1 }).lean();
    // The hackathon has one track; only teams that registered while it had one per theme picked a theme.
    const themes = rows.some((r) => r.track);
    csv = toCsv(
      ["Team ID", "Registered at (IST)", "Status", "Team", ...(themes ? ["Theme"] : []), "Members", "Lead name", "Lead e-mail", "Lead phone", "All members", "Idea title", "Idea summary", "GitHub", "Notes"],
      rows.map((r) => [r.regId, r.createdAt, r.status, r.teamName, ...(themes ? [r.track ? themeName(r.track) : ""] : []), r.members.length, r.members[0]?.name, r.members[0]?.email, r.members[0]?.phone, r.members.map((m) => `${m.name} <${m.email}> (${m.organisation})`), r.ideaTitle, r.ideaSummary, r.githubUrl, r.notes]),
    );
  } else if (kind === "enquiries") {
    const rows = await Enquiry.find({}).sort({ createdAt: 1 }).lean();
    csv = toCsv(["Received at (IST)", "Type", "Status", "Name", "E-mail", "Organisation", "Phone", "Subject", "Message", "Notes"], rows.map((r) => [r.createdAt, r.type, r.status, r.name, r.email, r.organisation, r.phone, r.subject, r.message, r.notes]));
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
