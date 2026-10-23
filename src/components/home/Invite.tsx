import { ArrowRight, CalendarDays, CircleCheck, MapPin, Presentation, Ticket } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Poster } from "@/components/ui/Poster";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { SiteSettings } from "@/lib/content/types";
import { copy } from "@/lib/copy";
import { registrationHref, venueLine } from "@/lib/event";
import { formatDateRange } from "@/lib/format";
import { isShown } from "@/lib/schema/section-order";

/** The invitation: who it's for and that registering is free but required, beside the invitation poster. */
export function Invite({ s }: { s: SiteSettings }) {
  const c = copy(s, "homeInvite");
  const points = [c.point1, c.point2, c.point3].filter(Boolean);
  return (
    <Section id="invitation" edit="home.invite" tone={c.tone} bg={c.background} labelledBy="invite-title" tags="stamp">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
        <div>
          <SectionHeading id="invite-title" eyebrow={c.eyebrow} title={c.title} description={c.description} className="mb-6 sm:mb-8" />
          {points.length ? (
            <ul className="grid gap-3">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-base text-fg sm:text-lg">
                  <CircleCheck size={22} aria-hidden className="mt-0.5 shrink-0 text-accent-ink" />
                  {p}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            {c.button ? (
              <ButtonLink href={registrationHref(s)} size="lg" icon={<Ticket size={18} aria-hidden />}>
                {c.button}
              </ButtonLink>
            ) : null}
            {c.posterLink && isShown(s, "register", "posters") ? (
              <ButtonLink href="/register#posters" size="lg" variant="outline" icon={<Presentation size={18} aria-hidden />} iconRight={<ArrowRight size={16} aria-hidden />}>
                {c.posterLink}
              </ButtonLink>
            ) : null}
          </div>
        </div>
        <Poster
          tone={c.tone}
          kicker={c.posterKicker}
          badge={c.posterBadge}
          title={c.posterTitle}
          text={c.posterText}
          facts={[
            { icon: <CalendarDays size={17} aria-hidden />, label: c.when, value: formatDateRange(s.startDate, s.endDate) },
            { icon: <MapPin size={17} aria-hidden />, label: c.where, value: venueLine(s) },
          ]}
          footnote={s.organisedBy}
          className="mx-auto w-full max-w-xl lg:max-w-none"
        />
      </div>
    </Section>
  );
}
