import { ArrowRight, CalendarDays, MapPin, Ticket } from "lucide-react";
import Link from "next/link";
import { Aura } from "@/components/aura/Aura";
import { MiniAura } from "@/components/aura/MiniAura";
import { NetworkCanvas } from "@/components/effects/NetworkCanvas";
import { Tilt } from "@/components/effects/Tilt";
import { DeadlineGate } from "@/components/forms/DeadlineGate";
import { Img } from "@/components/ui/Img";
import { THEME_META } from "@/lib/content/constants";
import type { SiteSettings } from "@/lib/content/types";
import { copy } from "@/lib/copy";
import { splitEventName, venueLine } from "@/lib/event";
import { formatDate, formatDateRange } from "@/lib/format";
import { Countdown } from "./Countdown";

const THEME_IMAGES: Record<string, string> = {
  healthcare: "/themes/health-care.png",
  science: "/themes/Agentic AI for Scientific Discovery.png",
  entrepreneurship: "/themes/Agentic AI and Enterprise.png",
  "Agentic AI in Healthcare": "/themes/health-care.png",
  "Agentic AI for Scientific Discovery": "/themes/Agentic AI for Scientific Discovery.png",
  "Agentic AI and Enterprise": "/themes/Agentic AI and Enterprise.png",
};

function StatusDot({ live = false }: { live?: boolean }) {
  return (
    <span aria-hidden className="relative flex h-2.5 w-2.5">
      {live ? <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-[var(--accent)]" /> : null}
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--accent-ink)]" />
    </span>
  );
}

function RegistrationFactValue({ s }: { s: SiteSettings }) {
  const c = copy(s, "homeHero");
  const closed = (
    <span className="tone-blush inline-flex items-center gap-2">
      <StatusDot />
      <span>{c.closed}</span>
    </span>
  );
  if (s.workshopStatus === "closed") return closed;
  if (s.workshopStatus !== "open") {
    return (
      <span className="tone-butter inline-flex items-center gap-2">
        <StatusDot />
        <span>{c.soon}</span>
      </span>
    );
  }
  const until = s.workshopDeadline ? formatDate(s.workshopDeadline, { day: "numeric", month: "short" }) : "";
  return (
    <DeadlineGate deadline={s.workshopDeadline} closed={closed}>
      <span className="tone-mint inline-flex items-center gap-2">
        <StatusDot live />
        <span>{c.open}</span>
        {until ? <span className="font-sans text-xs font-medium text-muted">{c.until ? `${c.until} ${until}` : until}</span> : null}
      </span>
    </DeadlineGate>
  );
}

export function Hero({ s }: { s: SiteSettings }) {
  const c = copy(s, "homeHero");
  const cThemes = copy(s, "homeThemes");
  const placard = copy(s, "homePlacard").text.trim();
  const { year } = splitEventName(s.eventName);

  return (
    <section data-edit="home.hero" className="relative isolate overflow-hidden" aria-labelledby="hero-title">
      {/* Background: pastel mesh, dotted grid and live agent network */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(70%_60%_at_15%_10%,color-mix(in_oklab,var(--azure)_38%,transparent),transparent_70%),radial-gradient(50%_55%_at_85%_20%,color-mix(in_oklab,var(--lilac)_34%,transparent),transparent_70%),radial-gradient(45%_50%_at_60%_95%,color-mix(in_oklab,var(--mint)_26%,transparent),transparent_70%)] dark:opacity-50"
      />
      <div
        aria-hidden
        className="bg-dots absolute inset-0 -z-20 [mask-image:radial-gradient(80%_70%_at_50%_40%,black,transparent)]"
      />
      <NetworkCanvas className="absolute inset-0 -z-10" avoid="[data-graph-avoid]" />

      <div className="container-site max-w-[82rem] pt-5 pb-8 sm:pt-6 lg:pt-8 lg:pb-10 relative">
        {/* 1. WORKSHOP TITLE & SUBTITLE - Spans full width with floating countdown widget in top-right */}
        <div className="mb-5 lg:mb-6">
          <h1
            id="hero-title"
            data-graph-avoid="text"
            className="font-display font-black tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-[2.65rem] xl:text-[3.15rem] leading-[1.08] text-fg whitespace-normal lg:whitespace-nowrap"
          >
            <span className="text-gradient animate-gradient">Agentic AI</span>{" "}
            <span className="text-[#0f172a] dark:text-[#f8fafc]">Workshop {year || "2026"}</span>
          </h1>
          <p
            data-graph-avoid="text"
            className="mt-2 max-w-3xl text-base sm:text-lg lg:text-[1.125rem] text-muted font-normal"
          >
            {s.tagline || "Where autonomous AI agents meet healthcare, science and enterprise."}
          </p>

          {/* Floating Compact Countdown: top-right on desktop, inline below subtitle on tablet/mobile */}
          {s.showCountdown ? (
            <div className="mt-3.5 lg:mt-0 lg:absolute lg:top-7 lg:right-4 xl:top-8 xl:right-8 z-20 inline-flex self-start">
              <Countdown
                target={s.startDate}
                end={s.endDate}
                label="WORKSHOP STARTS IN"
              />
            </div>
          ) : null}
        </div>

        {/* 2. MAIN 2-COLUMN HERO LAYOUT: LEFT (74%) THEMES, RIGHT (26%) REGISTRATION ROBOT */}
        <div className="grid grid-cols-1 lg:grid-cols-[74fr_26fr] gap-6 xl:gap-8 items-stretch">
          {/* LEFT SIDE: THREE THEMES */}
          <div id="themes" data-edit="home.themes" className="flex flex-col justify-between scroll-mt-24">
            <div className="mb-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] uppercase text-subtle">
                <MiniAura />
                <span>THREE THEMES, ONE QUESTION</span>
              </div>
              <h2 className="mt-1 font-display text-xl sm:text-2xl lg:text-[1.65rem] font-bold tracking-tight text-fg">
                What can agents do for us?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4 items-stretch">
              {s.themes.slice(0, 3).map((t, i) => {
                const meta = THEME_META[t.key] ?? THEME_META.general;
                const imgSrc = THEME_IMAGES[t.key] ?? THEME_IMAGES[t.title] ?? "/themes/health-care.png";
                return (
                  <div key={t.key} className="h-full">
                    <Tilt className="h-full">
                      <article
                        className={`tone-${meta.tone} card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface/90 p-4 transition-all duration-300 hover:shadow-card hover:border-[color-mix(in_oklab,var(--accent)_60%,var(--border))]`}
                      >
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_0%,color-mix(in_oklab,var(--accent)_22%,transparent),transparent_70%)]"
                        />
                        <div className="relative flex items-center justify-between gap-2">
                          <span className="tag tag-eyebrow text-[11px] font-bold py-0.5 px-2">
                            {cThemes.theme ? `${cThemes.theme} ${i + 1}` : `Theme ${i + 1}`}
                          </span>
                          <span
                            aria-hidden
                            className="font-display text-2xl font-black leading-none text-[color-mix(in_oklab,var(--accent)_45%,transparent)]"
                          >
                            0{i + 1}
                          </span>
                        </div>
                        <div className="relative my-2.5 aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/50 bg-surface-2 shadow-2xs">
                          <Img
                            src={imgSrc}
                            alt={t.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <h3 className="relative font-display text-[15px] sm:text-base font-bold text-fg leading-snug min-h-[2.6rem] flex items-center">
                          {t.title}
                        </h3>
                        <p className="relative mt-1 text-xs text-muted leading-relaxed line-clamp-3 flex-1">
                          {t.description}
                        </p>
                        <ul className="relative mt-2.5 grid gap-1 border-t border-border/70 pt-2 text-xs font-semibold">
                          {[
                            { href: `/programme?theme=${t.key}`, label: cThemes.talks || "Related talks & panels" },
                            { href: `/tutorials?theme=${t.key}`, label: cThemes.tutorials || "Tutorials & demos" },
                            { href: `/hackathon#track-${t.key}`, label: cThemes.track || "Hackathon track" },
                          ]
                            .filter((l) => l.label)
                            .map((l) => (
                              <li key={l.href}>
                                <Link
                                  href={l.href}
                                  className="group/link flex items-center justify-between rounded-lg px-2 py-1 text-accent-ink transition-colors hover:bg-accent-soft"
                                >
                                  <span>{l.label}</span>
                                  <ArrowRight size={13} aria-hidden className="transition-transform group-hover/link:translate-x-0.5 shrink-0" />
                                </Link>
                              </li>
                            ))}
                        </ul>
                      </article>
                    </Tilt>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDE: REGISTRATION ROBOT */}
          <div className="flex flex-col items-center justify-center h-full pt-4 lg:pt-0">
            <div
              data-launch-land=""
              data-edit="home.placard"
              className="relative mx-auto flex w-full max-w-[320px] items-center justify-center"
            >
              <div
                aria-hidden
                className="absolute inset-[6%] -z-10 rounded-full bg-[conic-gradient(from_200deg,var(--azure-soft),var(--lilac-soft),var(--blush-soft),var(--mint-soft),var(--azure-soft))] blur-2xl opacity-75"
              />
              <div
                aria-hidden
                className="absolute inset-[14%] -z-10 rounded-full border border-dashed border-border-strong/70 opacity-60 animate-spin-slow"
              />
              <Aura
                variant="hero"
                size={270}
                interactive
                entrance="load"
                placard={placard || "Registration opening soon"}
                label={placard ? `Aura, the workshop's agentic AI guide, holding a placard: “${placard}”` : "Aura holding registration opening soon placard"}
                className="max-w-full drop-shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* 3. BOTTOM: EVENT INFORMATION BAR */}
        <div className="mt-6 sm:mt-8">
          <dl
            data-graph-avoid=""
            className="grid grid-cols-1 divide-y divide-border/70 rounded-2xl border border-border/80 bg-surface/85 backdrop-blur-md shadow-xs sm:grid-cols-3 sm:divide-y-0 sm:divide-x"
          >
            {/* WHEN */}
            <div className="flex flex-col justify-center px-5 py-3 sm:px-6 sm:py-3.5">
              <dt className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">
                <span className="text-azure-ink"><CalendarDays size={15} aria-hidden /></span>
                {c.when || "WHEN"}
              </dt>
              <dd className="mt-1 font-display text-base font-semibold text-fg sm:text-[1.0625rem]">
                <time dateTime={s.startDate}>{formatDateRange(s.startDate, s.endDate)}</time>
              </dd>
            </div>

            {/* WHERE */}
            <div className="flex flex-col justify-center px-5 py-3 sm:px-6 sm:py-3.5">
              <dt className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">
                <span className="text-lilac-ink"><MapPin size={15} aria-hidden /></span>
                {c.where || "WHERE"}
              </dt>
              <dd className="mt-1 font-display text-base font-semibold text-fg sm:text-[1.0625rem]">
                {venueLine(s) || "IIT Delhi, Hauz Khas, New Delhi"}
              </dd>
            </div>

            {/* REGISTRATION */}
            <div className="flex flex-col justify-center px-5 py-3 sm:px-6 sm:py-3.5">
              <dt className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">
                <span className="text-mint-ink"><Ticket size={15} aria-hidden /></span>
                {c.registration || "REGISTRATION"}
              </dt>
              <dd className="mt-1 font-display text-base font-semibold text-fg sm:text-[1.0625rem]">
                <RegistrationFactValue s={s} />
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
