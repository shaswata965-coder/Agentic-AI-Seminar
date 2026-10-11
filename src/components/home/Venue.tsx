import { BedDouble, Building, Car, ExternalLink, MapPin, Navigation, Plane, ShieldCheck, TrainFront, TramFront, Lightbulb } from "lucide-react";
import { Aura } from "@/components/aura/Aura";
import { Badge } from "@/components/ui/Badge";
import { RichText } from "@/components/ui/RichText";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Tabs } from "@/components/ui/Tabs";
import type { SiteSettings } from "@/lib/content/types";
import { MapEmbed } from "./MapEmbed";

const MODE = {
  air: { Icon: Plane, label: "By air" },
  rail: { Icon: TrainFront, label: "By train" },
  metro: { Icon: TramFront, label: "By metro" },
  road: { Icon: Car, label: "By road" },
} as const;

const KIND = { campus: "On campus", guesthouse: "Guest house", hotel: "Hotel", area: "Area" } as Record<string, string>;

export function Venue({ s }: { s: SiteSettings }) {
  const q = s.mapQuery || s.venueAddress || s.venueName;
  const open = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  const dir = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
  return (
    <Section id="venue" tone="mint" labelledBy="venue-title" band>
      <SectionHeading
        id="venue-title"
        eyebrow="Venue & travel"
        title="Getting to IIT Delhi"
        description="Everything you need to reach the campus, find the venue and plan your stay."
        aside={<Aura variant="venue" size={130} interactive bubbleSide="left" className="hidden md:inline-block" />}
      />
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="card flex flex-col overflow-hidden" data-reveal>
          <div className="aspect-[16/11] w-full flex-1 bg-surface-2 sm:aspect-[16/9] lg:aspect-auto lg:min-h-[420px]">
            <MapEmbed query={q} embedUrl={s.mapEmbedUrl} title={`Map showing ${s.venueName}`} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="flex items-start gap-2 text-sm text-muted">
              <MapPin size={17} aria-hidden className="mt-0.5 shrink-0 text-mint-ink" />
              {s.venueAddress}
            </p>
            <div className="flex gap-2">
              <a href={open} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-sm font-semibold hover:border-brand hover:text-brand">
                <ExternalLink size={15} aria-hidden /> Open map
              </a>
              <a href={dir} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-2 text-sm font-semibold text-brand-fg">
                <Navigation size={15} aria-hidden /> Directions
              </a>
            </div>
          </div>
        </div>

        <div className="grid content-start gap-6">
          <div className="card p-6" data-reveal>
            <p className="text-xs font-bold tracking-[0.14em] text-subtle uppercase">Venue</p>
            <p className="mt-2 font-display text-xl font-semibold text-fg">{s.venueName}</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted">
              <Building size={16} aria-hidden className="text-subtle" />
              {s.venueHall ? s.venueHall : <span>Hall / building: <Badge tone="butter" size="xs">to be announced</Badge></span>}
            </p>
            <div className="mt-5 rounded-2xl bg-accent-soft p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-accent-ink">
                <ShieldCheck size={17} aria-hidden /> Campus entry
              </p>
              <RichText text={s.campusEntry} className="mt-2 text-sm text-fg" />
            </div>
          </div>
          {s.directions.length ? (
            <div className="card p-5" data-reveal>
              <Tabs
                ariaLabel="Directions"
                listClassName="w-full justify-start"
                items={s.directions.map((d, i) => {
                  const m = MODE[d.mode] ?? MODE.road;
                  return {
                    id: `${d.mode}-${i}`,
                    label: (
                      <span className="inline-flex items-center gap-1.5">
                        <m.Icon size={16} aria-hidden /> {m.label}
                      </span>
                    ),
                    panel: (
                      <div className="px-1">
                        <p className="font-display text-lg font-semibold text-fg">{d.title}</p>
                        <p className="mt-2 text-[15px] leading-relaxed text-muted">{d.details}</p>
                      </div>
                    ),
                  };
                })}
              />
              <p className="mt-4 text-xs text-subtle">Travel times are indicative — check live traffic and the DMRC journey planner.</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div>
          <h3 className="flex items-center gap-2 font-display text-2xl font-bold text-fg">
            <BedDouble size={24} aria-hidden className="text-mint-ink" /> Nearby accommodation
          </h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {s.accommodation.map((a, i) => (
              <li key={`${a.name}-${i}`} className="card p-5" data-reveal style={{ ["--reveal-delay" as string]: `${(i % 2) * 80}ms` }}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-[17px] font-semibold text-fg">{a.name}</p>
                  {a.distance ? <Badge tone="mint" size="xs" className="shrink-0 whitespace-nowrap">{a.distance}</Badge> : null}
                </div>
                {KIND[a.kind] ? <p className="mt-1 text-xs font-semibold text-subtle uppercase">{KIND[a.kind]}</p> : null}
                {a.note ? <p className="mt-2 text-sm text-muted">{a.note}</p> : null}
                {a.url ? (
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent-ink hover:underline">
                    Details <ExternalLink size={14} aria-hidden />
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
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
      </div>
    </Section>
  );
}
