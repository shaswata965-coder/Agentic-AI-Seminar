import { LoopArt } from "@/components/portals/PortalArt";
import { Portal } from "@/components/ui/Portal";
import { Eyebrow, Section } from "@/components/ui/Section";
import type { SiteSettings } from "@/lib/content/types";
import { venueLine } from "@/lib/event";
import { formatDateRange } from "@/lib/format";
import { AboutOrbit } from "./AboutOrbit";

/**
 * Home page About: Aura with About topics (Site settings → About & themes) around her. She thinks
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
  return (
    <Section id="about" tone="mint" wash labelledBy="about-title" tags="underline">
      <div className="text-center">
        <Eyebrow centered>About the workshop</Eyebrow>
        <h2 id="about-title" className="sr-only">
          About the workshop
        </h2>
      </div>

      <AboutOrbit points={points} />

      <div className="mt-10 flex justify-center sm:mt-14 lg:mt-6">
        <Portal
          href="/about"
          tone="mint"
          kicker="About the workshop"
          title="Why agentic AI, and why now?"
          text="The motivation, who should attend and what happens over the two days."
          art={<LoopArt />}
          className="w-full max-w-xl"
        />
      </div>
    </Section>
  );
}
