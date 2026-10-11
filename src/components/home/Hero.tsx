import { CalendarDays, MapPin } from "lucide-react";
import { Aura } from "@/components/aura/Aura";
import { NetworkCanvas } from "@/components/effects/NetworkCanvas";
import type { SiteSettings } from "@/lib/content/types";
import { splitEventName, venueLine } from "@/lib/event";
import { formatDate, formatDateRange } from "@/lib/format";
import { Countdown } from "./Countdown";

export function Hero({ s }: { s: SiteSettings }) {
  const dates = formatDateRange(s.startDate, s.endDate);
  // "Agentic AI Workshop 2026" → highlighted "Agentic AI", then "Workshop", then a muted "2026".
  const { title, year } = splitEventName(s.eventName);
  const lead = title.split(/\s+/);
  const last = lead.pop();
  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="hero-title" data-tags="tab">
      {/* Background: pastel mesh and dotted grid. */}
      <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(70%_60%_at_15%_10%,color-mix(in_oklab,var(--azure)_38%,transparent),transparent_70%),radial-gradient(50%_55%_at_85%_20%,color-mix(in_oklab,var(--lilac)_34%,transparent),transparent_70%),radial-gradient(45%_50%_at_60%_95%,color-mix(in_oklab,var(--mint)_26%,transparent),transparent_70%)] dark:opacity-50" />
      <div aria-hidden className="bg-dots absolute inset-0 -z-20 [mask-image:radial-gradient(80%_70%_at_50%_40%,black,transparent)]" />

      <div className="relative">
        {/* The live agent network stays on Aura's side, never behind the text. */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[45%] [mask-image:linear-gradient(to_right,transparent,black_35%)] lg:block">
          <NetworkCanvas className="h-full w-full" />
        </div>

        <div className="container-site grid items-center gap-8 pt-8 pb-10 sm:pt-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-6 lg:pt-14 lg:pb-14">
          <div>
            {s.heroNote ? (
              <p className="tag tag-lg tone-mint">
                <span aria-hidden className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-[var(--accent)]" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--accent-ink)]" />
                </span>
                {s.heroNote}
              </p>
            ) : null}
            <h1 id="hero-title" className="mt-5 font-display text-[2.6rem] leading-[1.02] font-extrabold tracking-tight text-fg sm:text-6xl lg:text-[4.4rem]">
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
            <p className="mt-5 max-w-xl text-lg text-muted sm:text-xl">{s.tagline}</p>

            <ul className="mt-7 flex flex-wrap gap-2.5">
              <li className="tag tag-lg tone-azure">
                <CalendarDays size={17} aria-hidden />
                <time dateTime={s.startDate}>{dates}</time>
              </li>
              <li className="tag tag-lg tone-blush">
                <MapPin size={17} aria-hidden />
                {venueLine(s)}
              </li>
            </ul>
          </div>

          <div className="relative mx-auto flex w-full max-w-[460px] justify-center pt-6 lg:pt-0">
            <div aria-hidden className="absolute inset-[8%] -z-10 rounded-full bg-[conic-gradient(from_200deg,var(--azure-soft),var(--lilac-soft),var(--blush-soft),var(--mint-soft),var(--azure-soft))] blur-2xl" />
            <div aria-hidden className="absolute inset-[16%] -z-10 rounded-full border border-dashed border-border-strong opacity-60 animate-spin-slow" />
            <Aura variant="hero" size={340} interactive entrance="load" className="max-w-[78vw]" />
          </div>
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
