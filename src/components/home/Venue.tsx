import { ExternalLink, MapPin } from "lucide-react";
import { Aura } from "@/components/aura/Aura";
import { RouteArt } from "@/components/portals/PortalArt";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Portal } from "@/components/ui/Portal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { VenueMap } from "@/components/venue/VenueMap";
import { mapLinks } from "@/components/venue/links";
import type { SiteSettings } from "@/lib/content/types";
import { copy } from "@/lib/copy";

/** Home page Venue & travel: the interactive route map. Campus entry, stays and local tips live on /venue. */
export function Venue({ s }: { s: SiteSettings }) {
  const { query, open } = mapLinks(s);
  const c = copy(s, "homeVenue");
  return (
    <Section id="venue" edit="home.venue" tone={c.tone} bg={c.background} labelledBy="venue-title" tags="tab">
      <SectionHeading
        id="venue-title"
        eyebrow={c.eyebrow}
        title={c.title}
        description={c.description}
        aside={<Aura variant="venue" size={130} interactive bubbleSide="left" className="max-md:hidden" />}
      />

      <VenueMap directions={s.directions} query={query}>
        <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
          <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink">
                <MapPin size={19} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-display font-semibold text-fg">
                  {s.venueName}
                  {s.venueHall ? <span className="text-muted">, {s.venueHall}</span> : null}
                </p>
                <p className="mt-0.5 text-sm text-muted">{s.venueAddress}</p>
                {!s.venueHall ? (
                  <Badge tone="butter" size="xs" className="mt-2">
                    {c.hallTba}
                  </Badge>
                ) : null}
              </div>
            </div>
            <ButtonLink href={open} variant="outline" size="sm" className="shrink-0 self-start sm:self-center" icon={<ExternalLink size={15} aria-hidden />}>
              {c.maps}
            </ButtonLink>
          </div>
          <Portal
            href="/venue"
            tone={c.tone}
            kicker={c.portalKicker}
            title={c.portalTitle}
            text={c.portalText}
            art={<RouteArt />}
          />
        </div>
      </VenueMap>
    </Section>
  );
}
