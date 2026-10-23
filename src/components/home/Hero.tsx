import { CalendarDays, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { NetworkCanvas } from "@/components/effects/NetworkCanvas";
import { Img } from "@/components/ui/Img";
import type { SiteSettings } from "@/lib/content/types";
import { copy } from "@/lib/copy";
import { hackathonShown, splitEventName, venueLine } from "@/lib/event";
import { formatDateRange } from "@/lib/format";
import { HeroPlacards, type HeroPlacard } from "./HeroPlacards";
import { RegisterChooser } from "./RegisterChooser";

/** The built-in photo of the IIT Delhi main building (public/hero), 1280×712. */
const BUILDING = "/hero/iit-delhi.webp";

/** The hero's photo: the one uploaded in Site settings → Home → Hero, or the built-in one. */
export const heroPhoto = (s: SiteSettings): string | undefined => (s.showHeroPhoto ? s.heroPhoto || BUILDING : undefined);

/**
 * The built-in photo behind Aura, placed so that the building's sign, "भारतीय प्रौद्योगिकी संस्थान दिल्ली" over
 * "INDIAN INSTITUTE OF TECHNOLOGY DELHI", sits just above her head and clear of the text: --w is the photo's width,
 * and the sign (at 30.7% across and 62.5% down the photo) is centred on her column, its top --y from the column's
 * top. The photo fades in from the left and out below the sign, behind her; while the text is above her (below lg)
 * it starts at the emblem over the sign, and her column leaves room for the sign above her. The agent network keeps
 * off the sign.
 */
function BuildingSign() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -z-20 aspect-[1280/712] [--w:860px] [--y:1.75rem] [mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,black_14%),linear-gradient(to_bottom,transparent_50%,black_54.5%,black_76%,transparent_96%)] sm:[--w:960px] lg:[--w:1100px] lg:[--y:-1.25rem] lg:[mask-image:linear-gradient(to_right,transparent,black_14%),linear-gradient(to_bottom,black_76%,transparent_96%)]"
      style={{ width: "var(--w)", left: "calc(50% - var(--w) * 0.307)", top: "calc(var(--y) - var(--w) * 0.3477)" }}
    >
      <Img src={BUILDING} alt="" width={1280} height={712} loading="eager" className="h-full w-full object-cover opacity-95 dark:opacity-60 dark:brightness-90" />
      <span data-graph-avoid="" className="absolute top-[52%] left-[15%] h-[24%] w-[32%]" />
    </div>
  );
}

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

export function Hero({ s }: { s: SiteSettings }) {
  const c = copy(s, "homeHero");
  const p = copy(s, "homePlacard");
  const tones = copy(s, "homeRegister");
  // Aura's two placards, in turn: workshop and hackathon registration ({status} is filled in as they show); the hackathon's only while it is shown.
  const placards: HeroPlacard[] = [
    { key: "workshop" as const, text: p.text, tab: p.workshopTab, tone: tones.workshopTone, status: s.workshopStatus, deadline: s.workshopDeadline },
    { key: "hackathon" as const, text: p.hackathon, tab: p.hackathonTab, tone: tones.hackathonTone, status: s.hackathonStatus, deadline: s.hackathonDeadline },
  ].filter((x) => x.text.trim() && (x.key !== "hackathon" || hackathonShown(s)));
  // "Agentic AI Workshop 2026" → highlighted "Agentic AI", then "Workshop", then a muted "2026".
  const { title, year } = splitEventName(s.eventName);
  const lead = title.split(/\s+/);
  const last = lead.pop();
  const photo = heroPhoto(s);
  return (
    <section data-edit="home.hero" className="fit-reset relative isolate overflow-hidden" aria-labelledby="hero-title">
      {/* Background: pastel mesh, dotted grid and the live agent network, which keeps clear of every [data-graph-avoid] text block. */}
      <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(70%_60%_at_15%_10%,color-mix(in_oklab,var(--azure)_38%,transparent),transparent_70%),radial-gradient(50%_55%_at_85%_20%,color-mix(in_oklab,var(--lilac)_34%,transparent),transparent_70%),radial-gradient(45%_50%_at_60%_95%,color-mix(in_oklab,var(--mint)_26%,transparent),transparent_70%)] dark:opacity-50" />
      {photo && photo !== BUILDING ? (
        // An uploaded photo at the top right, melting into the background to the left and downwards. While the
        // text spans the whole width (below lg) it stays faint behind it; beside the text it shows in full.
        <div aria-hidden className="pointer-events-none absolute top-0 right-0 -z-20 h-[55%] w-full [mask-image:radial-gradient(90%_80%_at_100%_0%,black_20%,transparent_75%)] sm:h-[60%] lg:h-[80%] lg:w-[64%] lg:[mask-image:radial-gradient(115%_100%_at_100%_0%,black_42%,transparent_80%)]">
          <Img src={photo} alt="" width={1280} height={712} loading="eager" className="h-full w-full object-cover object-[65%_35%] opacity-35 lg:opacity-90 dark:opacity-25 dark:brightness-75 lg:dark:opacity-40" />
        </div>
      ) : null}
      <div aria-hidden className="bg-dots absolute inset-0 -z-20 [mask-image:radial-gradient(80%_70%_at_50%_40%,black,transparent)]" />
      <NetworkCanvas className="absolute inset-0 -z-10" avoid="[data-graph-avoid]" />

      <div className="container-site grid items-center gap-8 pt-8 pb-10 sm:pt-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-x-6 lg:gap-y-10 lg:pt-14 lg:pb-12">
        {/* hero-copy makes the text as tall as Aura beside it; the space is shared evenly around the text. */}
        <div className="hero-copy flex flex-col justify-evenly gap-8">
          <div>
            {/* Who organises it, above the title (the emblem is in the navigation bar). */}
            <div data-graph-avoid="" className="mb-7">
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
        <div data-launch-land="" data-edit="home.placard" className={`relative mx-auto flex w-full max-w-[460px] flex-col items-center lg:pt-0 ${photo === BUILDING ? "pt-20" : "pt-6"}`}>
          {photo === BUILDING ? <BuildingSign /> : null}
          <div aria-hidden className="absolute inset-[8%] -z-10 rounded-full bg-[conic-gradient(from_200deg,var(--azure-soft),var(--lilac-soft),var(--blush-soft),var(--mint-soft),var(--azure-soft))] blur-2xl" />
          <div aria-hidden className="absolute inset-[16%] -z-10 rounded-full border border-dashed border-border-strong opacity-60 animate-spin-slow" />
          <HeroPlacards placards={placards} words={{ open: p.open, soon: p.soon, closed: p.closed }} />
        </div>

        <RegisterChooser s={s} className="lg:col-span-2" />
      </div>
    </section>
  );
}
