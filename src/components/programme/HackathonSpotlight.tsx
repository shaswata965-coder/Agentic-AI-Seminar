import { CalendarClock, Clock, Trophy, Users } from "lucide-react";
import { Aura } from "@/components/aura/Aura";
import { TrophyArt } from "@/components/portals/PortalArt";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { Portal } from "@/components/ui/Portal";
import { Eyebrow } from "@/components/ui/Section";
import { THEME_META } from "@/lib/content/constants";
import type { HackathonInfo, Session, SiteSettings } from "@/lib/content/types";
import { copy } from "@/lib/copy";
import { hackathonRegistrationHref } from "@/lib/event";
import { eventDayLabel, timeRange } from "@/lib/format";

/** The hackathon on the programme page: the pitch, its three themes and facts, when it sits in the schedule and its key dates. */
export function HackathonSpotlight({ s, h, sessions }: { s: SiteSettings; h: HackathonInfo; sessions: Session[] }) {
  const c = copy(s, "programmeHackathon");
  const facts = [
    { Icon: Users, label: c.teamSize, value: h.teamSize },
    { Icon: Clock, label: c.mode, value: h.mode },
    { Icon: Trophy, label: c.prizePool, value: h.prizePool },
  ];
  const slots = sessions.filter((x) => x.type === "hackathon");
  const dates = h.timeline.slice(0, 4);
  return (
    <section id="hackathon" data-edit="programme.hackathon" aria-labelledby="hackathon-title" data-tags="slash" className={`tone-${c.tone} scroll-mt-24 py-16 sm:py-24`}>
      <div className="container-site">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-[linear-gradient(135deg,var(--aqua-soft),var(--lilac-soft)_55%,var(--blush-soft))] p-6 shadow-card-lg sm:p-12">
          <div aria-hidden className="bg-dots pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_left,black,transparent)]" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="order-2 mx-auto lg:order-1">
              <Aura variant="hackathon" size={280} interactive className="max-w-[70vw]" />
            </div>
            <div className="order-1 lg:order-2">
              {c.eyebrow ? <Eyebrow>{c.eyebrow}</Eyebrow> : null}
              <h2 id="hackathon-title" className="mt-4 font-display text-3xl font-bold text-fg sm:text-[2.75rem] sm:leading-[1.1]">
                {h.title}
              </h2>
              <p className="mt-4 max-w-xl text-lg text-muted">{h.tagline}</p>
              {c.themes && h.tracks.length ? <p className="mt-6 text-xs font-bold tracking-[0.14em] text-subtle uppercase">{c.themes}</p> : null}
              <ul className={cn("flex flex-wrap gap-2", c.themes ? "mt-2.5" : "mt-6")}>
                {h.tracks.map((t) => {
                  const meta = THEME_META[t.theme] ?? THEME_META.general;
                  return (
                    <li key={t.title} className={`tone-${meta.tone} tag text-sm`}>
                      {t.title}
                    </li>
                  );
                })}
              </ul>
              <dl className="mt-7 grid gap-3 sm:grid-cols-3">
                {facts.map(({ Icon, label, value }) => (
                  <div key={label} className="rounded-2xl bg-surface/80 p-4 ring-1 ring-border backdrop-blur">
                    <dt className="flex items-center gap-1.5 text-xs font-bold tracking-[0.12em] text-subtle uppercase">
                      <Icon size={14} aria-hidden /> {label}
                    </dt>
                    <dd className="mt-1.5 font-display text-[15px] font-semibold text-fg">{value || "TBA"}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <ButtonLink href={hackathonRegistrationHref(s)} size="lg" className="self-start sm:self-center">
                  {c.button}
                </ButtonLink>
                <Portal href="/hackathon" tone={c.tone} compact kicker={c.eyebrow} title={c.portalTitle} art={<TrophyArt />} className="sm:max-w-sm sm:flex-1" />
              </div>
            </div>
          </div>
        </div>

        {slots.length || dates.length ? (
          <div className={`mt-6 grid gap-4 ${slots.length && dates.length ? "lg:grid-cols-2" : ""}`}>
            {slots.length ? (
              <div className="card p-6">
                <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-fg">
                  <CalendarClock size={19} aria-hidden className="text-accent-ink" /> {c.slots}
                </h3>
                <ul className="mt-3 grid gap-2">
                  {slots.map((x) => (
                    <li key={x.id}>
                      <a href={`#session-${x.id}`} className="flex flex-wrap items-baseline gap-x-3 rounded-xl bg-surface-2 px-3 py-2.5 transition-colors hover:bg-accent-soft">
                        <span className="font-mono text-xs font-bold text-accent-ink tabular">
                          {eventDayLabel(s.startDate, x.day)} · {timeRange(x.start, x.end)}
                        </span>
                        <span className="font-semibold text-fg">{x.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {dates.length ? (
              <div className="card p-6">
                <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-fg">
                  <Trophy size={19} aria-hidden className="text-accent-ink" /> {c.dates}
                </h3>
                <ol className={`mt-3 grid gap-2 sm:grid-cols-2 ${slots.length ? "" : "lg:grid-cols-4"}`}>
                  {dates.map((m, i) => (
                    <li key={`${m.label}-${i}`} className="rounded-xl bg-surface-2 px-3 py-2.5">
                      <p className="font-mono text-xs font-bold text-accent-ink">{m.dateLabel || c.dateTba}</p>
                      <p className="mt-0.5 font-semibold text-fg">{m.label}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
