import { LoopArt } from "@/components/portals/PortalArt";
import { Portal } from "@/components/ui/Portal";
import { Eyebrow, Section } from "@/components/ui/Section";
import type { SiteSettings } from "@/lib/content/types";
import { venueLine } from "@/lib/event";
import { copy } from "@/lib/copy";
import { formatDateRange } from "@/lib/format";
import { AboutOrbit } from "./AboutOrbit";

/**
 * Home page About: Aura with About topics (Site settings → Home → About) around her. She thinks
 * quietly until you hover a topic, then points at it and answers with its summary. The full About
 * text lives on /about, which the portal under the orbit leads to.
 * Answers may use {dates}, {venue} and {event}, filled in from Site settings.
 */
export function About({ s }: { s: SiteSettings }) {
  const fill = (text: string) =>
    text
      .replaceAll("{dates}", formatDateRange(s.startDate, s.endDate))
      .replaceAll("{venue}", venueLine(s))
      .replaceAll("{event}", s.eventName);
  const points = s.aboutPoints.slice(0, 8).map((p) => ({ ...p, title: fill(p.title), description: fill(p.description) }));
  const c = copy(s, "homeAbout");
  return (
    <Section id="about" edit="home.about" tone={c.tone} bg={c.background} labelledBy="about-title" tags="underline">
      <div className="text-center">
        {c.eyebrow ? <Eyebrow centered>{c.eyebrow}</Eyebrow> : null}
        <h2 id="about-title" className="sr-only">
          {c.eyebrow || c.portalTitle}
        </h2>
      </div>

      <AboutOrbit points={points} />

      <div className="mt-10 flex justify-center sm:mt-14 lg:mt-6">
        <Portal
          href="/about"
          tone={c.tone}
          kicker={c.portalKicker}
          title={c.portalTitle}
          text={c.portalText}
          art={<LoopArt />}
          className="w-full max-w-xl lg:max-w-2xl"
        />
      </div>
    </Section>
  );
}
