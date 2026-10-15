import type { NextRequest } from "next/server";
import { stripMarkdown } from "@/components/ui/RichText";
import { buildIcs } from "@/lib/calendar";
import { getSavedSettings, getSessions, getSpeakers } from "@/lib/content/queries";
import { venueLine } from "@/lib/event";
import { eventDayDate, istDateTime } from "@/lib/format";
import { absoluteUrl } from "@/lib/paths";
import { workshopIcs } from "@/lib/server/emails";

function ics(body: string, filename: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}

/** /api/calendar → both workshop days; /api/calendar?session=<id> → one session. */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("session");
  const s = await getSavedSettings();
  if (!id) return ics(workshopIcs(s), "agentic-ai-workshop-2026.ics");

  const [sessions, speakers] = await Promise.all([getSessions(), getSpeakers()]);
  const x = s.programmeStatus === "tba" ? undefined : sessions.find((v) => v.id === id);
  if (!x) return new Response("Session not found", { status: 404 });
  const date = eventDayDate(s.startDate, x.day);
  const start = istDateTime(date, x.start);
  const end = istDateTime(date, x.end || x.start);
  if (!start || !end) return new Response("Session has no time yet", { status: 404 });
  const names = [...x.speakers, ...x.panelists].map((sid) => speakers.find((sp) => sp.id === sid)?.name).filter(Boolean);
  const body = buildIcs(
    [
      {
        uid: `aaiw-session-${x.id}@${new URL(absoluteUrl("/")).hostname}`,
        title: x.title,
        start,
        end: end.getTime() > start.getTime() ? end : new Date(start.getTime() + 30 * 60_000),
        description: [names.length ? `Speakers: ${names.join(", ")}` : "", stripMarkdown(x.description), absoluteUrl(`/programme?day=${x.day}#session-${x.id}`)].filter(Boolean).join("\n\n"),
        location: [x.room, venueLine(s)].filter(Boolean).join(", "),
        url: absoluteUrl("/programme"),
      },
    ],
    s.eventName,
  );
  return ics(body, `session-${x.id}.ics`);
}
