import { Aura } from "@/components/aura/Aura";
import { AddToCalendar } from "@/components/share/AddToCalendar";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import type { SiteSettings } from "@/lib/content/types";
import { copy } from "@/lib/copy";
import { eventCalendarLinks, registrationHref } from "@/lib/event";

/** Shown instead of the schedule while the programme status is "To be announced" or no sessions exist yet. */
export function ScheduleTba({ s }: { s: SiteSettings }) {
  const c = copy(s, "programmeSchedule");
  return (
    <div className="card relative overflow-hidden p-6 sm:p-10">
      <div aria-hidden className="wash pointer-events-none absolute inset-0" />
      <div className="relative grid items-center gap-8 md:grid-cols-[auto_1fr]">
        <div className="mx-auto">
          <Aura variant="programme" size={210} interactive tips={["The schedule is being finalised. Check back soon!", "Add the dates to your calendar meanwhile."]} />
        </div>
        <div>
          {c.tbaBadge ? (
            <Badge tone="butter" dot>
              {c.tbaBadge}
            </Badge>
          ) : null}
          <h3 className="mt-3 font-display text-2xl font-bold text-fg sm:text-3xl">{c.tbaTitle}</h3>
          {s.programmeNote ? <p className="mt-3 max-w-xl text-muted">{s.programmeNote}</p> : null}
          {c.tbaText ? <p className="mt-3 max-w-xl text-muted">{c.tbaText}</p> : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <AddToCalendar links={eventCalendarLinks(s)} label={c.tbaCalendar} />
            {c.tbaRegister ? (
              <ButtonLink href={registrationHref(s)} variant="soft">
                {c.tbaRegister}
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
