import { Download, Printer } from "lucide-react";
import type { Metadata } from "next";
import { ScheduleTba } from "@/components/home/ProgrammePreview";
import { PageHero } from "@/components/layout/PageHero";
import { ProgrammeView, type MiniSpeaker, type ProgrammeSession } from "@/components/programme/ProgrammeView";
import { AddToCalendar } from "@/components/share/AddToCalendar";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { TagScope } from "@/components/ui/Tag";
import { getSessions, getSettings, getSpeakers } from "@/lib/content/queries";
import { eventCalendarLinks, eventDays } from "@/lib/event";
import { eventDayDate, eventDayLabel, formatDateRange } from "@/lib/format";
import { absoluteUrl } from "@/lib/paths";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: "Programme",
    description: `Day-wise schedule of the ${s.eventName}: keynotes, talks, panels, tutorials, demos and the hackathon, ${formatDateRange(s.startDate, s.endDate)}.`,
    alternates: { canonical: absoluteUrl("/programme") },
  };
}

export default async function ProgrammePage() {
  const [s, sessions, speakers] = await Promise.all([getSettings(), getSessions(), getSpeakers()]);
  const days = eventDays(s).map((d) => ({ day: d.day, label: eventDayLabel(s.startDate, d.day) }));
  const tba = s.programmeStatus === "tba" || sessions.length === 0;
  const withTimes: ProgrammeSession[] = sessions.map((x) => {
    const date = eventDayDate(s.startDate, x.day);
    return { ...x, startIso: `${date}T${x.start || "00:00"}:00+05:30`, endIso: `${date}T${x.end || x.start || "23:59"}:00+05:30` };
  });
  const mini: Record<string, MiniSpeaker> = Object.fromEntries(speakers.map((sp) => [sp.id, { id: sp.id, name: sp.name, slug: sp.slug, affiliation: sp.affiliation }]));
  const pdfHref = s.schedulePdf || "/api/programme/pdf";

  return (
    <TagScope style="bracket">
      <PageHero
        tone="azure"
        crumb="Programme"
        eyebrow="Programme"
        title="Programme"
        aura="programme"
        description={
          <p>
            {formatDateRange(s.startDate, s.endDate)} at {s.venueName}. Filter by theme or session type, star sessions to build your own agenda and add them to your calendar.
          </p>
        }
      >
        {!tba ? (
          <>
            <ButtonLink href={pdfHref} download icon={<Download size={18} aria-hidden />}>
              Download PDF
            </ButtonLink>
            <AddToCalendar links={eventCalendarLinks(s)} />
          </>
        ) : null}
      </PageHero>
      <section className="tone-azure py-12 sm:py-16">
        <div className="container-site">
          {tba ? (
            <ScheduleTba s={s} />
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-center gap-3">
                {s.programmeStatus === "draft" ? (
                  <Badge tone="butter" dot>
                    Draft: subject to change
                  </Badge>
                ) : (
                  <Badge tone="mint" dot>
                    Final schedule
                  </Badge>
                )}
                {s.programmeNote ? <p className="text-sm text-muted">{s.programmeNote}</p> : null}
                <span className="ml-auto hidden items-center gap-1.5 text-xs text-subtle sm:inline-flex">
                  <Printer size={14} aria-hidden /> Tip: you can also print this page.
                </span>
              </div>
              <ProgrammeView sessions={withTimes} speakers={mini} days={days} />
            </>
          )}
        </div>
      </section>
    </TagScope>
  );
}
