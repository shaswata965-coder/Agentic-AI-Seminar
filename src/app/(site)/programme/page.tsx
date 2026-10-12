import { ArrowRight, Download, GraduationCap, MapPin, Mic, Printer, Ticket } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { HackathonSpotlight } from "@/components/programme/HackathonSpotlight";
import { Kiosks } from "@/components/programme/Kiosks";
import { ProgrammeOverview } from "@/components/programme/ProgrammeOverview";
import { ProgrammeView, type MiniSpeaker, type ProgrammeSession } from "@/components/programme/ProgrammeView";
import { ScheduleTba } from "@/components/programme/ScheduleTba";
import { AddToCalendar } from "@/components/share/AddToCalendar";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import { TagScope } from "@/components/ui/Tag";
import { getHackathon, getKiosks, getSessions, getSettings, getSpeakers } from "@/lib/content/queries";
import type { SiteSettings } from "@/lib/content/types";
import { eventCalendarLinks, eventDays, registrationHref, venueLine } from "@/lib/event";
import { eventDayDate, eventDayLabel, formatDateRange } from "@/lib/format";
import { absoluteUrl } from "@/lib/paths";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: "Programme",
    description: `Day-wise schedule of the ${s.eventName}: keynotes, talks, panels, tutorials, demos, industry kiosks and the hackathon, ${formatDateRange(s.startDate, s.endDate)}.`,
    alternates: { canonical: absoluteUrl("/programme") },
  };
}

const JUMPS = [
  { href: "#overview", label: "At a glance" },
  { href: "#schedule", label: "Schedule" },
  { href: "#kiosks", label: "Industry kiosks" },
  { href: "#hackathon", label: "Hackathon" },
  { href: "#plan", label: "Plan your visit" },
];

function registrationText(s: SiteSettings) {
  if (s.workshopStatus === "open") return "Registration is open. Save your seat.";
  if (s.workshopStatus === "closed") return "Registration has closed.";
  return "Registration opens soon.";
}

export default async function ProgrammePage() {
  const [s, sessions, speakers, kiosks, h] = await Promise.all([getSettings(), getSessions(), getSpeakers(), getKiosks(), getHackathon()]);
  const days = eventDays(s).map((d) => ({ day: d.day, label: eventDayLabel(s.startDate, d.day) }));
  const tba = s.programmeStatus === "tba" || sessions.length === 0;
  const withTimes: ProgrammeSession[] = sessions.map((x) => {
    const date = eventDayDate(s.startDate, x.day);
    return { ...x, startIso: `${date}T${x.start || "00:00"}:00+05:30`, endIso: `${date}T${x.end || x.start || "23:59"}:00+05:30` };
  });
  const mini: Record<string, MiniSpeaker> = Object.fromEntries(speakers.map((sp) => [sp.id, { id: sp.id, name: sp.name, slug: sp.slug, affiliation: sp.affiliation }]));
  const pdfHref = s.schedulePdf || "/api/programme/pdf";
  const plan: { href: string; title: string; text: string; icon: ReactNode; tone: string }[] = [
    { href: "/venue", title: "Venue & travel", text: `${venueLine(s)}. Maps, directions and places to stay.`, icon: <MapPin size={21} aria-hidden />, tone: "tone-mint" },
    { href: registrationHref(s), title: "Registration", text: registrationText(s), icon: <Ticket size={21} aria-hidden />, tone: "tone-butter" },
    { href: "/tutorials", title: "Tutorials & demos", text: "Levels, prerequisites and materials for the hands-on sessions.", icon: <GraduationCap size={21} aria-hidden />, tone: "tone-lilac" },
    { href: "/speakers", title: "Speakers", text: "Who is speaking, their talks and the panels.", icon: <Mic size={21} aria-hidden />, tone: "tone-peach" },
  ];

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
            {formatDateRange(s.startDate, s.endDate)} at {s.venueName}. Keynotes, talks, panels, hands-on tutorials and live demos, with industry kiosks and the hackathon final alongside.
          </p>
        }
      >
        {!tba ? (
          <ButtonLink href={pdfHref} download icon={<Download size={18} aria-hidden />}>
            Download PDF
          </ButtonLink>
        ) : null}
        <AddToCalendar links={eventCalendarLinks(s)} />
      </PageHero>

      <nav aria-label="On this page" className="border-b border-border bg-bg-soft">
        <ol className="container-site flex gap-1 overflow-x-auto py-2 [scrollbar-width:none]">
          {JUMPS.map((j, i) => (
            <li key={j.href} className="shrink-0">
              <a href={j.href} className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-surface hover:text-fg">
                <span className="font-mono text-[11px] text-subtle transition-colors group-hover:text-brand">{String(i + 1).padStart(2, "0")}</span>
                {j.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <ProgrammeOverview s={s} sessions={sessions} tba={tba} />

      <Section id="schedule" tone="azure" band labelledBy="schedule-title">
        <SectionHeading id="schedule-title" eyebrow="Schedule" title="Day by day" className="mb-6 sm:mb-8" />
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
            <p className="mb-6 max-w-2xl text-sm text-muted">Filter by theme or session type, star sessions to build your own agenda and add them to your calendar.</p>
            <ProgrammeView sessions={withTimes} speakers={mini} days={days} />
          </>
        )}
      </Section>

      <Kiosks s={s} kiosks={kiosks} />

      <HackathonSpotlight s={s} h={h} sessions={tba ? [] : sessions} />

      <Section id="plan" tone="mint" band labelledBy="plan-title">
        <SectionHeading id="plan-title" eyebrow="Plan your visit" title="Before you come" className="mb-8 sm:mb-10" />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plan.map((p, i) => (
            <li key={p.title} data-reveal style={{ "--reveal-delay": `${i * 70}ms` } as CSSProperties}>
              <Link href={p.href} data-glow="" className={`${p.tone} card group flex h-full flex-col p-6 transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-lg`}>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-soft text-accent-ink transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:rotate-6">{p.icon}</span>
                <span className="mt-4 flex items-center gap-1.5 font-display text-lg font-semibold text-fg">
                  {p.title}
                  <ArrowRight size={16} aria-hidden className="opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                </span>
                <span className="mt-1.5 text-sm text-muted">{p.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </TagScope>
  );
}
