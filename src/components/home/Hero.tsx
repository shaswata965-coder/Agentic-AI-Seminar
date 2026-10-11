import { ArrowRight, Atom, CalendarDays, HeartPulse, MapPin, Rocket, Ticket, Trophy } from "lucide-react";
import { Aura } from "@/components/aura/Aura";
import { NetworkCanvas } from "@/components/effects/NetworkCanvas";
import { AddToCalendar } from "@/components/share/AddToCalendar";
import { ShareButtons } from "@/components/share/ShareButtons";
import { ButtonLink } from "@/components/ui/Button";
import { Img } from "@/components/ui/Img";
import type { SiteSettings } from "@/lib/content/types";
import { eventCalendarLinks, hackathonRegistrationHref, registrationHref, venueLine } from "@/lib/event";
import { formatDate, formatDateRange } from "@/lib/format";
import { absoluteUrl } from "@/lib/paths";
import { Countdown } from "./Countdown";

export function LogoLockup({ s }: { s: SiteSettings }) {
  const box = "flex h-12 items-center rounded-2xl border border-border bg-surface/80 px-3.5 shadow-card backdrop-blur";
  return (
    <div className="flex flex-wrap items-center gap-2.5" aria-label="Organised by IIT Delhi and the Yardi School of Artificial Intelligence">
      <div className={box}>
        {s.logoIITD ? (
          <Img src={s.logoIITD} alt="IIT Delhi" className="h-8 w-auto" loading="eager" />
        ) : (
          <span className="leading-none">
            <span className="block font-display text-[15px] font-bold text-fg">IIT Delhi</span>
            <span className="mt-0.5 block text-[10px] font-semibold tracking-wide text-subtle uppercase">Indian Institute of Technology</span>
          </span>
        )}
      </div>
      <span aria-hidden className="font-display text-lg font-bold text-subtle">×</span>
      <div className={box}>
        {s.logoScAI ? (
          <Img src={s.logoScAI} alt="Yardi School of Artificial Intelligence (ScAI)" className="h-8 w-auto" loading="eager" />
        ) : (
          <span className="leading-none">
            <span className="block font-display text-[15px] font-bold text-fg">Yardi ScAI</span>
            <span className="mt-0.5 block text-[10px] font-semibold tracking-wide text-subtle uppercase">School of Artificial Intelligence</span>
          </span>
        )}
      </div>
    </div>
  );
}

const THEME_CHIPS = [
  { label: "Healthcare", tone: "tone-blush", Icon: HeartPulse, pos: "left-0 top-[18%]", delay: "0s" },
  { label: "Science", tone: "tone-lilac", Icon: Atom, pos: "right-0 top-[8%]", delay: "-2s" },
  { label: "Startups", tone: "tone-peach", Icon: Rocket, pos: "right-2 bottom-[22%]", delay: "-4s" },
];

export function Hero({ s }: { s: SiteSettings }) {
  const dates = formatDateRange(s.startDate, s.endDate);
  const links = eventCalendarLinks(s);
  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="hero-title">
      {/* Background: pastel mesh + dotted grid + live agent network */}
      <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(70%_60%_at_15%_10%,color-mix(in_oklab,var(--azure)_38%,transparent),transparent_70%),radial-gradient(50%_55%_at_85%_20%,color-mix(in_oklab,var(--lilac)_34%,transparent),transparent_70%),radial-gradient(45%_50%_at_60%_95%,color-mix(in_oklab,var(--mint)_26%,transparent),transparent_70%)] dark:opacity-50" />
      <div aria-hidden className="bg-dots absolute inset-0 -z-20 [mask-image:radial-gradient(80%_70%_at_50%_40%,black,transparent)]" />
      <NetworkCanvas className="absolute inset-0 -z-10" />

      <div className="container-site grid items-center gap-8 pt-8 pb-10 sm:pt-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-6 lg:pt-14 lg:pb-14">
        <div>
          <LogoLockup s={s} />
          {s.heroNote ? (
            <p className="tone-mint mt-7 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3.5 py-1.5 text-sm font-semibold text-accent-ink ring-1 ring-inset ring-[color-mix(in_oklab,var(--accent)_40%,transparent)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-[var(--accent)]" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--accent-ink)]" />
              </span>
              {s.heroNote}
            </p>
          ) : null}
          <h1 id="hero-title" className="mt-5 font-display text-[2.6rem] leading-[1.02] font-extrabold tracking-tight text-fg sm:text-6xl lg:text-[4.4rem]">
            {s.eventName.replace(/\s*20\d\d\s*$/, "") === "Agentic AI Workshop" ? (
              <>
                <span className="text-gradient animate-gradient">Agentic AI</span> Workshop <span className="text-muted">2026</span>
              </>
            ) : (
              s.eventName
            )}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted sm:text-xl">{s.tagline}</p>

          <ul className="mt-7 flex flex-wrap gap-2.5 text-[15px] font-semibold text-fg">
            <li className="flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 shadow-card backdrop-blur">
              <CalendarDays size={18} aria-hidden className="text-azure-ink" />
              <time dateTime={s.startDate}>{dates}</time>
            </li>
            <li className="flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 shadow-card backdrop-blur">
              <MapPin size={18} aria-hidden className="text-blush-ink" />
              {venueLine(s)}
            </li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={registrationHref(s)} size="lg" icon={<Ticket size={19} aria-hidden />}>
              Register
            </ButtonLink>
            <ButtonLink href={hackathonRegistrationHref(s)} size="lg" variant="soft" className="tone-lilac" icon={<Trophy size={19} aria-hidden />}>
              Join the Hackathon
            </ButtonLink>
            <ButtonLink href="/programme" size="lg" variant="outline" iconRight={<ArrowRight size={18} aria-hidden />}>
              View Programme
            </ButtonLink>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <AddToCalendar links={links} variant="ghost" size="sm" />
            <ShareButtons url={absoluteUrl("/")} text={`${s.eventName} at IIT Delhi, ${dates}`} />
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-[460px] justify-center pt-6 lg:pt-0">
          <div aria-hidden className="absolute inset-[8%] -z-10 rounded-full bg-[conic-gradient(from_200deg,var(--azure-soft),var(--lilac-soft),var(--blush-soft),var(--mint-soft),var(--azure-soft))] blur-2xl" />
          <div aria-hidden className="absolute inset-[16%] -z-10 rounded-full border border-dashed border-border-strong opacity-60 animate-spin-slow" />
          <Aura variant="hero" size={340} interactive greet entrance="load" className="max-w-[78vw]" />
          {THEME_CHIPS.map(({ label, tone, Icon, pos, delay }) => (
            <span
              key={label}
              aria-hidden
              className={`${tone} ${pos} absolute hidden animate-float items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1.5 text-sm font-semibold text-accent-ink shadow-card ring-1 ring-border backdrop-blur sm:inline-flex`}
              style={{ animationDelay: delay }}
            >
              <Icon size={15} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {s.showCountdown ? (
        <div className="container-site pb-6">
          <div className="card glass relative flex flex-col gap-5 p-4 sm:p-6 md:flex-row md:items-center">
            <div className="flex items-center gap-3 md:w-64 md:shrink-0">
              <Aura variant="countdown" size={72} lite />
              <div>
                <p className="font-display text-lg font-semibold text-fg">Countdown</p>
                <p className="text-sm text-muted">
                  to {formatDate(s.startDate, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })} IST
                </p>
              </div>
            </div>
            <Countdown target={s.startDate} end={s.endDate} className="flex-1" />
          </div>
        </div>
      ) : null}
    </section>
  );
}
