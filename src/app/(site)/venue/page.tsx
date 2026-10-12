import { ArrowRight, BedDouble, Building, Car, ExternalLink, Lightbulb, MapPin, Navigation, Plane, Route, ShieldCheck, TrainFront, TramFront } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Aura } from "@/components/aura/Aura";
import { PageHero } from "@/components/layout/PageHero";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { RichText } from "@/components/ui/RichText";
import { Section, SectionHeading } from "@/components/ui/Section";
import { TagScope } from "@/components/ui/Tag";
import { mapLinks, routeUrl } from "@/components/venue/links";
import { MapEmbed } from "@/components/venue/MapEmbed";
import { getSettings } from "@/lib/content/queries";
import { absoluteUrl } from "@/lib/paths";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: "Venue & travel",
    description: `How to reach ${s.venueName} for the ${s.eventName}: directions by air, train, metro and road, campus entry, places to stay and local tips.`,
    alternates: { canonical: absoluteUrl("/venue") },
  };
}

const MODE = {
  air: { Icon: Plane, label: "By air", tone: "tone-azure" },
  rail: { Icon: TrainFront, label: "By train", tone: "tone-lilac" },
  metro: { Icon: TramFront, label: "By metro", tone: "tone-mint" },
  road: { Icon: Car, label: "By road", tone: "tone-peach" },
} as const;

const KIND: Record<string, string> = { campus: "On campus", guesthouse: "Guest house", hotel: "Hotel", area: "Area" };

export default async function VenuePage() {
  const s = await getSettings();
  const { query, open, directions } = mapLinks(s);
  return (
    <TagScope style="tab">
      <PageHero
        tone="mint"
        crumb="Venue & travel"
        eyebrow="Venue & travel"
        title="Your guide to getting to IIT Delhi"
        aura="venue"
        description={<p>Directions from the airport, the railway stations and the metro, what to bring for campus entry, where to stay and a few local tips.</p>}
      >
        <ButtonLink href={directions} icon={<Navigation size={17} aria-hidden />}>
          Directions
        </ButtonLink>
        <ButtonLink href="/#venue" variant="outline" icon={<Route size={17} aria-hidden />}>
          Interactive route map
        </ButtonLink>
      </PageHero>

      <Section tone="mint" labelledBy="venue-place-title">
        <SectionHeading id="venue-place-title" eyebrow="The venue" title={s.venueName} className="mb-8 sm:mb-10" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="card flex min-w-0 flex-col overflow-hidden" data-reveal>
            <div className="aspect-[4/3] w-full min-w-0 flex-1 bg-surface-2 sm:aspect-[16/9] lg:aspect-auto lg:min-h-[420px]">
              <MapEmbed query={query} embedUrl={s.mapEmbedUrl} title={`Map showing ${s.venueName}`} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
              <p className="flex items-start gap-2 text-sm text-muted">
                <MapPin size={17} aria-hidden className="mt-0.5 shrink-0 text-mint-ink" />
                {s.venueAddress}
              </p>
              <div className="flex gap-2">
                <ButtonLink href={open} variant="outline" size="sm" icon={<ExternalLink size={15} aria-hidden />}>
                  Open map
                </ButtonLink>
                <ButtonLink href={directions} size="sm" icon={<Navigation size={15} aria-hidden />}>
                  Directions
                </ButtonLink>
              </div>
            </div>
          </div>

          <div className="card h-fit p-6" data-reveal>
            <p className="text-xs font-bold tracking-[0.14em] text-subtle uppercase">Venue</p>
            <p className="mt-2 font-display text-xl font-semibold text-fg">{s.venueName}</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted">
              <Building size={16} aria-hidden className="text-subtle" />
              {s.venueHall ? (
                s.venueHall
              ) : (
                <span>
                  Hall / building:{" "}
                  <Badge tone="butter" size="xs">
                    to be announced
                  </Badge>
                </span>
              )}
            </p>
            <div className="mt-5 rounded-2xl bg-accent-soft p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-accent-ink">
                <ShieldCheck size={17} aria-hidden /> Campus entry
              </p>
              <RichText text={s.campusEntry} className="mt-2 text-sm text-fg" />
            </div>
          </div>
        </div>
      </Section>

      {s.directions.length ? (
        <Section tone="azure" band labelledBy="getting-here-title">
          <SectionHeading
            id="getting-here-title"
            eyebrow="Getting here"
            title="By air, train, metro or road"
            description={
              <p>
                Travel times are indicative. Check live traffic and the DMRC journey planner, or follow each route on the{" "}
                <Link href="/#venue" className="mi-underline font-semibold text-accent-ink">
                  interactive map
                </Link>
                .
              </p>
            }
            className="mb-8 sm:mb-10"
          />
          <ul className="grid gap-4 md:grid-cols-2">
            {s.directions.map((d, i) => {
              const m = MODE[d.mode] ?? MODE.road;
              return (
                <li key={`${d.mode}-${i}`} data-reveal style={{ "--reveal-delay": `${(i % 2) * 80}ms` } as CSSProperties} className={`${m.tone} card group flex flex-col p-6 transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-lg`}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-ink transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-6">
                      <m.Icon size={21} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold tracking-[0.14em] text-subtle uppercase">{m.label}</p>
                      <h3 className="font-display text-lg font-semibold text-fg">{d.title}</h3>
                    </div>
                  </div>
                  <p className="mt-4 flex-1 text-[15px] leading-relaxed text-muted">{d.details}</p>
                  <a href={routeUrl(query, d.mode)} target="_blank" rel="noopener noreferrer" className="group/plan mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-accent-ink">
                    <Navigation size={15} aria-hidden className="transition-transform duration-300 group-hover/plan:-translate-y-0.5 group-hover/plan:translate-x-0.5" />
                    <span className="mi-underline">Plan this route in Google Maps</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </Section>
      ) : null}

      <Section tone="peach" labelledBy="stay-title">
        <SectionHeading
          id="stay-title"
          eyebrow="Where to stay"
          title="Nearby accommodation"
          description="Guest houses, hotels and neighbourhoods within easy reach of campus."
          className="mb-8 sm:mb-10"
        />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <ul className="grid content-start gap-3 sm:grid-cols-2">
            {s.accommodation.map((a, i) => (
              <li key={`${a.name}-${i}`} className="card p-5 transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-lg" data-reveal data-glow="" style={{ "--reveal-delay": `${(i % 2) * 80}ms` } as CSSProperties}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="flex items-start gap-2 font-display text-[17px] font-semibold text-fg">
                    <BedDouble size={18} aria-hidden className="mt-0.5 shrink-0 text-accent-ink" />
                    {a.name}
                  </h3>
                  {a.distance ? (
                    <Badge tone="mint" size="xs" className="shrink-0 whitespace-nowrap">
                      {a.distance}
                    </Badge>
                  ) : null}
                </div>
                {KIND[a.kind] ? <p className="mt-1 text-xs font-semibold text-subtle uppercase">{KIND[a.kind]}</p> : null}
                {a.note ? <p className="mt-2 text-sm text-muted">{a.note}</p> : null}
                {a.url ? (
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="group/more mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-ink">
                    <span className="mi-underline">Details</span>
                    <ExternalLink size={14} aria-hidden className="transition-transform duration-300 group-hover/more:translate-x-0.5 group-hover/more:-translate-y-0.5" />
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
          {s.localInfo.length ? (
            <div className="tone-butter card h-fit p-6" data-reveal>
              <div className="flex items-center gap-3">
                <Aura variant="travel" size={70} lite />
                <h3 className="font-display text-xl font-bold text-fg">Local tips</h3>
              </div>
              <ul className="mt-4 space-y-3">
                {s.localInfo.map((tip, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-muted">
                    <Lightbulb size={17} aria-hidden className="mt-0.5 shrink-0 text-butter-ink" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <ButtonLink href="/#faq" variant="outline" iconRight={<ArrowRight size={17} aria-hidden />}>
            Travel questions? See the FAQ
          </ButtonLink>
        </div>
      </Section>
    </TagScope>
  );
}
