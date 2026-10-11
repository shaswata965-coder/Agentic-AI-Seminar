import { ArrowRight, Download } from "lucide-react";
import { Aura } from "@/components/aura/Aura";
import { SessionBadges, SessionPeople, SessionRoom } from "@/components/programme/SessionMeta";
import { AddToCalendar } from "@/components/share/AddToCalendar";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Tabs } from "@/components/ui/Tabs";
import { SESSION_TYPE_META, SESSION_TYPES } from "@/lib/content/constants";
import type { Session, SiteSettings, Speaker } from "@/lib/content/types";
import { eventCalendarLinks, eventDays, registrationHref } from "@/lib/event";
import { eventDayLabel, timeRange } from "@/lib/format";

export function ScheduleTba({ s, compact = false }: { s: SiteSettings; compact?: boolean }) {
  return (
    <div className="card relative overflow-hidden p-6 sm:p-10">
      <div aria-hidden className="wash pointer-events-none absolute inset-0" />
      <div className="relative grid items-center gap-8 md:grid-cols-[auto_1fr]">
        <div className="mx-auto">
          <Aura variant="programme" size={compact ? 170 : 210} interactive tips={["The schedule is being finalised. Check back soon!", "Add the dates to your calendar meanwhile."]} />
        </div>
        <div>
          <Badge tone="butter" dot>
            Coming soon
          </Badge>
          <h3 className="mt-3 font-display text-2xl font-bold text-fg sm:text-3xl">Schedule to be announced</h3>
          <p className="mt-3 max-w-xl text-muted">{s.programmeNote}</p>
          <p className="mt-5 text-sm font-semibold text-subtle">Expect sessions of these types:</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {SESSION_TYPES.filter((t) => t !== "other").map((t) => (
              <li key={t}>
                <Badge tone={SESSION_TYPE_META[t].tone} dot>
                  {SESSION_TYPE_META[t].label}
                </Badge>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <AddToCalendar links={eventCalendarLinks(s)} label="Add the dates to your calendar" />
            <ButtonLink href={registrationHref(s)} variant="soft">
              Register to get updates
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionRowCompact({ session, byId }: { session: Session; byId: Record<string, Speaker> }) {
  return (
    <li className="grid gap-2 rounded-2xl border border-border bg-surface p-4 transition-shadow hover:shadow-card sm:grid-cols-[7.5rem_1fr] sm:gap-5">
      <p className="font-display text-[15px] font-bold text-fg tabular">{timeRange(session.start, session.end)}</p>
      <div className="min-w-0 space-y-2">
        <SessionBadges session={session} />
        <p className="font-display text-lg leading-snug font-semibold text-fg">{session.title}</p>
        <SessionPeople session={session} byId={byId} />
        {session.type !== "break" ? <SessionRoom room={session.room} /> : null}
      </div>
    </li>
  );
}

export function ProgrammePreview({ s, sessions, speakers }: { s: SiteSettings; sessions: Session[]; speakers: Speaker[] }) {
  const byId = Object.fromEntries(speakers.map((sp) => [sp.id, sp]));
  const days = eventDays(s);
  const tba = s.programmeStatus === "tba" || sessions.length === 0;
  return (
    <Section tone="azure" labelledBy="programme-preview-title" tags="bracket">
      <SectionHeading
        id="programme-preview-title"
        eyebrow="Programme"
        title="Two days of ideas, hands‑on learning and building"
        description={
          s.programmeStatus === "draft" ? "Draft schedule: sessions and timings may still change." : "A day-wise view of keynotes, talks, panels, tutorials, demos and the hackathon."
        }
        aside={
          !tba ? (
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/programme" iconRight={<ArrowRight size={17} aria-hidden />}>
                Full programme
              </ButtonLink>
              <ButtonLink href={s.schedulePdf || "/api/programme/pdf"} variant="outline" download icon={<Download size={17} aria-hidden />}>
                PDF
              </ButtonLink>
            </div>
          ) : null
        }
      />
      {tba ? (
        <ScheduleTba s={s} />
      ) : (
        <Tabs
          ariaLabel="Programme by day"
          items={days.map((d) => {
            const list = sessions.filter((x) => Number(x.day) === d.day).slice(0, 5);
            return {
              id: `day-${d.day}`,
              label: (
                <span>
                  Day {d.day} <span className="font-medium">· {eventDayLabel(s.startDate, d.day)}</span>
                </span>
              ),
              panel: list.length ? (
                <ul className="grid gap-3">
                  {list.map((x) => (
                    <SessionRowCompact key={x.id} session={x} byId={byId} />
                  ))}
                </ul>
              ) : (
                <p className="rounded-2xl border border-dashed border-border-strong p-8 text-center text-muted">Sessions for this day will be announced soon.</p>
              ),
            };
          })}
        />
      )}
    </Section>
  );
}
