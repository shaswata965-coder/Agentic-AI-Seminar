import { CalendarDays, MapPin, Ticket } from "lucide-react";
import type { ReactNode } from "react";
import { Aura } from "@/components/aura/Aura";
import { NetworkCanvas } from "@/components/effects/NetworkCanvas";
import { DeadlineGate } from "@/components/forms/DeadlineGate";
import type { SiteSettings } from "@/lib/content/types";
import { splitEventName, venueLine } from "@/lib/event";
import { formatDate, formatDateRange } from "@/lib/format";
import { Countdown } from "./Countdown";

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

function StatusDot({ live = false }: { live?: boolean }) {
  return (
    <span aria-hidden className="relative flex h-2.5 w-2.5">
      {live ? <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-[var(--accent)]" /> : null}
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--accent-ink)]" />
    </span>
  );
}

/** Workshop registration as set in Admin → Site settings → Registration, closing by itself at the deadline. */
function RegistrationFact({ s }: { s: SiteSettings }) {
  const icon = <Ticket size={14} aria-hidden />;
  const closed = (
    <Fact label="Registration" icon={icon} tone="tone-blush">
      <span className="inline-flex items-center gap-2">
        <StatusDot />
        Closed
      </span>
    </Fact>
  );
  if (s.workshopStatus === "closed") return closed;
  if (s.workshopStatus !== "open") {
    return (
      <Fact label="Registration" icon={icon} tone="tone-butter">
        <span className="inline-flex items-center gap-2">
          <StatusDot />
          Opening soon
        </span>
      </Fact>
    );
  }
  const until = s.workshopDeadline ? formatDate(s.workshopDeadline, { day: "numeric", month: "short" }) : "";
  return (
    <DeadlineGate deadline={s.workshopDeadline} closed={closed}>
      <Fact label="Registration" icon={icon} tone="tone-mint">
        <span className="inline-flex items-center gap-2">
          <StatusDot live />
          Open
          {until ? <span className="font-sans text-sm font-medium text-muted">until {until}</span> : null}
        </span>
      </Fact>
    </DeadlineGate>
  );
}

export function Hero({ s }: { s: SiteSettings }) {
  // "Agentic AI Workshop 2026" → highlighted "Agentic AI", then "Workshop", then a muted "2026".
  const { title, year } = splitEventName(s.eventName);
  const lead = title.split(/\s+/);
  const last = lead.pop();
  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="hero-title">
      {/* Background: pastel mesh, dotted grid and the live agent network, which keeps clear of every [data-graph-avoid] text block. */}
      <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(70%_60%_at_15%_10%,color-mix(in_oklab,var(--azure)_38%,transparent),transparent_70%),radial-gradient(50%_55%_at_85%_20%,color-mix(in_oklab,var(--lilac)_34%,transparent),transparent_70%),radial-gradient(45%_50%_at_60%_95%,color-mix(in_oklab,var(--mint)_26%,transparent),transparent_70%)] dark:opacity-50" />
      <div aria-hidden className="bg-dots absolute inset-0 -z-20 [mask-image:radial-gradient(80%_70%_at_50%_40%,black,transparent)]" />
      <NetworkCanvas className="absolute inset-0 -z-10" avoid="[data-graph-avoid]" />

      <div className="container-site grid items-center gap-8 pt-8 pb-10 sm:pt-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-6 lg:pt-14 lg:pb-14">
        {/* hero-copy keeps the hero as tall as it used to be; the space is shared evenly around the text. */}
        <div className="hero-copy flex flex-col justify-evenly gap-8">
          <div>
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
            <Fact label="When" icon={<CalendarDays size={14} aria-hidden />} tone="tone-azure">
              <time dateTime={s.startDate}>{formatDateRange(s.startDate, s.endDate)}</time>
            </Fact>
            <Fact label="Where" icon={<MapPin size={14} aria-hidden />} tone="tone-lilac">
              {venueLine(s)}
            </Fact>
            <RegistrationFact s={s} />
          </dl>
        </div>

        <div className="relative mx-auto flex w-full max-w-[460px] justify-center pt-6 lg:pt-0">
          <div aria-hidden className="absolute inset-[8%] -z-10 rounded-full bg-[conic-gradient(from_200deg,var(--azure-soft),var(--lilac-soft),var(--blush-soft),var(--mint-soft),var(--azure-soft))] blur-2xl" />
          <div aria-hidden className="absolute inset-[16%] -z-10 rounded-full border border-dashed border-border-strong opacity-60 animate-spin-slow" />
          <Aura variant="hero" size={340} interactive entrance="load" className="max-w-[78vw]" />
        </div>
      </div>

      {s.showCountdown ? (
        <div className="container-site pb-6">
          <div data-graph-avoid="" className="card glass relative flex flex-col gap-5 p-4 sm:p-6 md:flex-row md:items-center">
            <div className="flex items-center gap-3 md:w-64 md:shrink-0">
              <Aura variant="countdown" size={72} lite />
              <div>
                <p className="font-display text-lg font-semibold text-fg">Countdown</p>
                <p className="text-sm text-muted">to {formatDate(s.startDate, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })} IST</p>
              </div>
            </div>
            <Countdown target={s.startDate} end={s.endDate} className="flex-1" />
          </div>
        </div>
      ) : null}
    </section>
  );
}
