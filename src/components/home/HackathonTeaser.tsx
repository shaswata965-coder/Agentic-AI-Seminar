import { ArrowRight, Clock, Trophy, Users } from "lucide-react";
import { Aura } from "@/components/aura/Aura";
import { OneQuestion } from "@/components/hackathon/OneQuestion";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";
import type { HackathonInfo, SiteSettings } from "@/lib/content/types";
import { copy } from "@/lib/copy";
import { hackathonRegistrationHref } from "@/lib/event";

/** The hackathon on the home page: its pitch, its one question (a single track for every team) and facts, with team registration and a button to the full hackathon page. */
export function HackathonTeaser({ s, h }: { s: SiteSettings; h: HackathonInfo }) {
  const c = copy(s, "homeHackathon");
  const facts = [
    { Icon: Users, label: c.teamSize, value: h.teamSize },
    { Icon: Clock, label: c.mode, value: h.mode },
    { Icon: Trophy, label: c.prizePool, value: h.prizePool },
  ];
  return (
    <section id="hackathon" data-edit="home.hackathon" aria-labelledby="hackathon-teaser-title" data-tags="tab" className={`tone-${c.tone} scroll-mt-24 py-16 sm:py-24`}>
      <div className="container-site">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-[linear-gradient(135deg,var(--aqua-soft),var(--lilac-soft)_55%,var(--blush-soft))] p-6 shadow-card-lg sm:p-12">
          <div aria-hidden className="bg-dots pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_left,black,transparent)]" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="order-2 mx-auto lg:order-1">
              <Aura variant="hackathon" size={280} interactive className="max-w-[70vw]" />
            </div>
            <div className="order-1 lg:order-2">
              {c.eyebrow ? <Eyebrow>{c.eyebrow}</Eyebrow> : null}
              <h2 id="hackathon-teaser-title" className="mt-4 font-display text-3xl font-bold text-fg sm:text-[2.75rem] sm:leading-[1.1]">
                {h.title}
              </h2>
              <p className="mt-4 max-w-xl text-lg text-muted">{h.tagline}</p>
              <OneQuestion question={h.question} ones={[c.one1, c.one2, c.one3]} label={c.questionLabel} link={c.questionLink} className="mt-6 max-w-xl" />
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
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={hackathonRegistrationHref(s)} size="lg">
                  {c.button}
                </ButtonLink>
                <ButtonLink href="/hackathon" size="lg" variant="outline" iconRight={<ArrowRight size={18} aria-hidden />}>
                  {c.details}
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
