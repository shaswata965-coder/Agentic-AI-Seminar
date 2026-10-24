import { ArrowRight, CalendarDays, MapPin, Presentation, Sparkles, Ticket } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Poster } from "@/components/ui/Poster";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { SiteSettings } from "@/lib/content/types";
import { copy } from "@/lib/copy";
import { registrationHref, venueLine } from "@/lib/event";
import { formatDateRange } from "@/lib/format";
import { isShown } from "@/lib/schema/section-order";

/**
 * Registration is open: places are limited and confirmed by the organising committee. The button, what to expect
 * and the call to bring your research to the poster session, beside the poster.
 */
export function Invite({ s }: { s: SiteSettings }) {
  const c = copy(s, "homeInvite");
  const posters = isShown(s, "register", "posters");
  return (
    <Section id="join" edit="home.invite" tone={c.tone} bg={c.background} labelledBy="invite-title" tags="stamp">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
        <div>
          <SectionHeading id="invite-title" eyebrow={c.eyebrow} title={c.title} description={c.description} className="mb-6 sm:mb-8" />
          {c.free ? <p className="text-base font-semibold text-fg sm:text-lg">{c.free}</p> : null}
          {c.button ? (
            <div className="mt-4">
              <ButtonLink href={registrationHref(s)} size="lg" icon={<Ticket size={18} aria-hidden />}>
                {c.button}
              </ButtonLink>
            </div>
          ) : null}
          <div className="mt-8 grid gap-4">
            {c.expectTitle || c.expectText ? (
              <div className="card flex items-start gap-4 p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-ink">
                  <CalendarDays size={20} aria-hidden />
                </span>
                <div>
                  {c.expectTitle ? <h3 className="font-display text-lg font-bold text-fg">{c.expectTitle}</h3> : null}
                  {c.expectText ? <p className="mt-1 text-[15px] leading-relaxed text-muted">{c.expectText}</p> : null}
                </div>
              </div>
            ) : null}
            {c.researchTitle || c.researchText ? (
              <div className="card flex items-start gap-4 p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-ink">
                  <Presentation size={20} aria-hidden />
                </span>
                <div>
                  {c.researchTitle ? <h3 className="font-display text-lg font-bold text-fg">{c.researchTitle}</h3> : null}
                  {c.researchText ? <p className="mt-1 text-[15px] leading-relaxed text-muted">{c.researchText}</p> : null}
                  {c.researchTheme ? (
                    <p className="mt-3 flex items-start gap-2 rounded-xl bg-accent-soft px-3 py-2 text-[15px] font-semibold text-accent-ink">
                      <Sparkles size={17} aria-hidden className="mt-0.5 shrink-0" />
                      {c.researchTheme}
                    </p>
                  ) : null}
                  {c.posterLink && posters ? (
                    <Link href="/register#posters" className="group/link mt-3 inline-flex items-center gap-1 font-semibold text-accent-ink">
                      <span className="mi-underline">{c.posterLink}</span>
                      <ArrowRight size={15} aria-hidden className="transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <Poster
          tone={c.tone}
          photo={s.invitePhoto}
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
