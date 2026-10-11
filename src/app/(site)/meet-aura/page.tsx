import type { Metadata } from "next";
import { Aura } from "@/components/aura/Aura";
import { AuraPlayground } from "@/components/aura/AuraPlayground";
import { AURA_PRESETS } from "@/components/aura/presets";
import type { AuraVariant } from "@/components/aura/types";
import { PageHero } from "@/components/layout/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { absoluteUrl } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Meet Aura",
  description: "Aura is the workshop's agentic AI mascot — a friendly hovering robot who changes for every part of the site.",
  alternates: { canonical: absoluteUrl("/meet-aura") },
};

const WHERE: Partial<Record<AuraVariant, string>> = {
  hero: "Home — waving hello", countdown: "Countdown timer", announcements: "Announcements", thinker: "About — the agent loop",
  healthcare: "Theme: Healthcare", science: "Theme: Scientific Discovery", entrepreneurship: "Theme: Entrepreneurship",
  programme: "Programme", speakers: "Speakers", tutorials: "Tutorials", demos: "Live demos", hackathon: "Hackathon", trophy: "Prizes & winners",
  registration: "Registration", success: "Registration complete", kiosks: "Industry kiosks", venue: "Venue", travel: "Travel tips",
  sponsors: "Partners & sponsors", organisers: "Organisers", volunteers: "Volunteers (coming soon)", faq: "FAQ", answer: "FAQ — answer found",
  contact: "Contact form", notFound: "Page not found", sleep: "Footer", gallery: "Photo gallery", recordings: "Recordings", admin: "Admin panel", error: "Error page",
};

export default function MeetAuraPage() {
  const variants = (Object.keys(AURA_PRESETS) as AuraVariant[]).filter((v) => WHERE[v]);
  return (
    <>
      <PageHero
        tone="aqua"
        crumb="Meet Aura"
        eyebrow="Our mascot"
        title="Meet Aura"
        aura="hero"
        description={
          <p>
            Aura is the workshop&apos;s agentic AI guide: a rounded, hovering robot with a floating head and glowing eyes. Like a real agent, she adapts to her task — so you&apos;ll find her in a different role in every section of the site. Click her for tips, or press Ctrl/⌘ + K to ask her anything.
          </p>
        }
      />
      <Section tone="azure" labelledBy="playground-title">
        <SectionHeading id="playground-title" eyebrow="Playground" title="Mix and match" description="Try Aura's expressions, poses, props and effects." />
        <AuraPlayground />
      </Section>
      <Section tone="lilac" labelledBy="looks-title" band>
        <SectionHeading id="looks-title" eyebrow="Around the site" title={`${variants.length} looks, one guide`} description="Every page and section has its own version of Aura." />
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {variants.map((v) => (
            <li key={v} data-glow="" className="card flex flex-col items-center p-4 text-center transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-lg">
              <Aura variant={v} size={130} lite label={AURA_PRESETS[v].label} entrance="zip" />
              <p className="mt-2 text-sm font-semibold text-fg">{WHERE[v]}</p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
