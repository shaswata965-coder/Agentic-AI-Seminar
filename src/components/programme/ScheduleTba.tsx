import { Aura } from "@/components/aura/Aura";
import { AddToCalendar } from "@/components/share/AddToCalendar";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import type { SiteSettings } from "@/lib/content/types";
import { eventCalendarLinks, registrationHref } from "@/lib/event";

/** Shown instead of the schedule while the programme status is "To be announced" or no sessions exist yet. */
export function ScheduleTba({ s }: { s: SiteSettings }) {
  return (
    <div className="card relative overflow-hidden p-6 sm:p-10">
      <div aria-hidden className="wash pointer-events-none absolute inset-0" />
      <div className="relative grid items-center gap-8 md:grid-cols-[auto_1fr]">
        <div className="mx-auto">
          <Aura variant="programme" size={210} interactive tips={["The schedule is being finalised. Check back soon!", "Add the dates to your calendar meanwhile."]} />
        </div>
        <div>
          <Badge tone="butter" dot>
            Coming soon
          </Badge>
          <h3 className="mt-3 font-display text-2xl font-bold text-fg sm:text-3xl">Schedule to be announced</h3>
          {s.programmeNote ? <p className="mt-3 max-w-xl text-muted">{s.programmeNote}</p> : null}
          <p className="mt-3 max-w-xl text-muted">Session times, rooms and speakers will appear here, with filters by theme and format, a personal agenda and calendar links.</p>
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
