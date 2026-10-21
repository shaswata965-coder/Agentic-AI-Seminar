import { CalendarDays, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { Aura } from "@/components/aura/Aura";
import { NetworkCanvas } from "@/components/effects/NetworkCanvas";
import { InstituteLogo } from "@/components/layout/InstituteLogo";
import type { HackathonInfo, SiteSettings } from "@/lib/content/types";
import { copy } from "@/lib/copy";
import { splitEventName, venueLine } from "@/lib/event";
import { formatDate, formatDateRange } from "@/lib/format";
import { Countdown } from "./Countdown";
import { HeroPlacards, type HeroPlacard } from "./HeroPlacards";
import { RegisterChooser } from "./RegisterChooser";

/** One fact under the title: a coloured rule, a small label and the value. */
function Fact({ label, icon, tone, children }: { label: string; icon: ReactNode; tone: string; children: ReactNode }) {
  return (
    <div data-graph-avoid="" className={`${tone} border-t-2 border-[color-mix(in_oklab,var(--accent)_60%,var(--accent-ink))] pt-3`}>
      <dt className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">
        <span className="text-accent-ink">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 font-display text-lg font-semibold text-fg">{children}</dd>
    </div>
  );
}

export function Hero({ s, h }: { s: SiteSettings; h: HackathonInfo }) {
  const c = copy(s, "homeHero");
  const p = copy(s, "homePlacard");
  const tones = copy(s, "homeRegister");
  // Aura's two placards, in turn: workshop and hackathon registration ({status} is filled in as they show).
  const placards: HeroPlacard[] = [
    { key: "workshop" as const, text: p.text, tab: p.workshopTab, tone: tones.workshopTone, status: s.workshopStatus, deadline: s.workshopDeadline },
    { key: "hackathon" as const, text: p.hackathon, tab: p.hackathonTab, tone: tones.hackathonTone, status: s.hackathonStatus, deadline: s.hackathonDeadline },
  ].filter((x) => x.text.trim());
  // "Agentic AI Workshop 2026" → highlighted "Agentic AI", then "Workshop", then a muted "2026".
  const { title, year } = splitEventName(s.eventName);
  const lead = title.split(/\s+/);
  const last = lead.pop();
  return (
    <section data-edit="home.hero" className="relative isolate overflow-hidden" aria-labelledby="hero-title">
      {/* Background: pastel mesh, dotted grid and the live agent network, which keeps clear of every [data-graph-avoid] text block. */}
      <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(70%_60%_at_15%_10%,color-mix(in_oklab,var(--azure)_38%,transparent),transparent_70%),radial-gradient(50%_55%_at_85%_20%,color-mix(in_oklab,var(--lilac)_34%,transparent),transparent_70%),radial-gradient(45%_50%_at_60%_95%,color-mix(in_oklab,var(--mint)_26%,transparent),transparent_70%)] dark:opacity-50" />
      <div aria-hidden className="bg-dots absolute inset-0 -z-20 [mask-image:radial-gradient(80%_70%_at_50%_40%,black,transparent)]" />
      <NetworkCanvas className="absolute inset-0 -z-10" avoid="[data-graph-avoid]" />

      <div className="container-site grid items-center gap-8 pt-8 pb-10 sm:pt-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-x-6 lg:gap-y-10 lg:pt-14 lg:pb-12">
        {/* hero-copy makes the text as tall as Aura beside it; the space is shared evenly around the text. */}
        <div className="hero-copy flex flex-col justify-evenly gap-8">
          <div>
            {/* IIT Delhi, large: its emblem on a white seal in a slowly turning ring, with the institute's name. */}
            <div data-graph-avoid="" className="mb-7 flex items-center gap-4 sm:gap-5">
              <span className="relative shrink-0">
                <span aria-hidden className="absolute -inset-2 animate-spin-slow rounded-full border border-dashed border-border-strong opacity-70" />
                <span className="relative flex rounded-full bg-[conic-gradient(from_210deg,var(--azure),var(--lilac),var(--blush),var(--mint),var(--azure))] p-[3px] shadow-card-lg">
                  <span className="flex rounded-full bg-white p-1.5">
                    <InstituteLogo kind="iitd" upload={s.logoIITD} decorative className="h-16 sm:h-20 lg:h-[5.5rem]" />
                  </span>
                </span>
              </span>
              <p className="min-w-0 leading-snug">
                {c.organisedBy ? <span className="block text-[11px] font-bold tracking-[0.18em] text-subtle uppercase">{c.organisedBy}</span> : null}
                <span className="mt-1 block font-display text-lg font-bold text-fg sm:text-xl">{c.institute}</span>
                {c.school ? <span className="block text-sm text-muted sm:text-[15px]">{c.school}</span> : null}
              </p>
            </div>
            <h1 id="hero-title" data-graph-avoid="text" className="font-display text-[2.6rem] leading-[1.02] font-extrabold tracking-tight text-fg sm:text-6xl lg:text-[4.4rem]">
              {lead.length ? (
                <>
                  <span className="text-gradient animate-gradient">{lead.join(" ")}</span> {last}
                </>
              ) : (
                <span className="text-gradient animate-gradient">{last}</span>
              )}
              {year ? (
                <>
                  {" "}
                  <span className="text-muted">{year}</span>
                </>
              ) : null}
            </h1>
            <p data-graph-avoid="text" className="mt-5 max-w-xl text-lg text-muted sm:text-xl">
              {s.tagline}
            </p>
          </div>

          <dl className="flex flex-wrap gap-x-10 gap-y-5">
            <Fact label={c.when} icon={<CalendarDays size={14} aria-hidden />} tone="tone-azure">
              <time dateTime={s.startDate}>{formatDateRange(s.startDate, s.endDate)}</time>
            </Fact>
            <Fact label={c.where} icon={<MapPin size={14} aria-hidden />} tone="tone-lilac">
              {venueLine(s)}
            </Fact>
          </dl>
        </div>

        {/* data-launch-land: after the loading screen, Aura flies down into place from where her ship went up (loading.css).
            She holds up the placards from Home → Hero announcements in turn. */}
        <div data-launch-land="" data-edit="home.placard" className="relative mx-auto flex w-full max-w-[460px] flex-col items-center pt-6 lg:pt-0">
          <div aria-hidden className="absolute inset-[8%] -z-10 rounded-full bg-[conic-gradient(from_200deg,var(--azure-soft),var(--lilac-soft),var(--blush-soft),var(--mint-soft),var(--azure-soft))] blur-2xl" />
          <div aria-hidden className="absolute inset-[16%] -z-10 rounded-full border border-dashed border-border-strong opacity-60 animate-spin-slow" />
          <HeroPlacards placards={placards} words={{ open: p.open, soon: p.soon, closed: p.closed }} />
        </div>

        <RegisterChooser s={s} h={h} className="lg:col-span-2" />
      </div>

      {s.showCountdown ? (
        <div className="container-site pb-6">
          <div data-graph-avoid="" className="card glass relative flex flex-col gap-5 p-5 sm:p-7 md:flex-row md:items-center md:gap-8">
            <div className="flex items-center gap-3 md:w-[17.5rem] md:shrink-0 md:border-r md:border-border md:pr-6">
              <Aura variant="countdown" size={68} lite />
              <div>
                <p className="text-[11px] font-bold tracking-[0.2em] text-subtle uppercase">{c.countdown}</p>
                <p className="mt-1 font-display text-lg leading-snug font-semibold text-fg">{formatDate(s.startDate, { day: "numeric", month: "long", year: "numeric" })}</p>
                <p className="text-sm text-muted">{formatDate(s.startDate, { hour: "2-digit", minute: "2-digit", hour12: false })} IST</p>
              </div>
            </div>
            <Countdown target={s.startDate} end={s.endDate} className="flex-1" />
          </div>
        </div>
      ) : null}
    </section>
  );
}
