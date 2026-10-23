import type { Metadata } from "next";
import { Aura } from "@/components/aura/Aura";
import { AuraPlayground } from "@/components/aura/AuraPlayground";
import { AURA_PRESETS } from "@/components/aura/presets";
import type { AuraVariant } from "@/components/aura/types";
import { InOrder } from "@/components/layout/InOrder";
import { PageHero } from "@/components/layout/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { TagScope } from "@/components/ui/Tag";
import { getSettings } from "@/lib/content/queries";
import { copy } from "@/lib/copy";
import { absoluteUrl } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Meet Aura",
  description: "Aura is the workshop's agentic AI mascot: a friendly hovering robot who changes for every part of the site.",
  alternates: { canonical: absoluteUrl("/meet-aura") },
};

const WHERE: Partial<Record<AuraVariant, string>> = {
  hero: "Home: waving hello", countdown: "Registration opening soon", announcements: "Announcements", thinker: "About: the agent loop",
  healthcare: "Theme: Healthcare", science: "Theme: Scientific Discovery", enterprise: "Theme: Enterprise",
  programme: "Programme", speakers: "Speakers", tutorials: "Tutorials", demos: "Live demos", hackathon: "Hackathon", trophy: "Prizes & winners",
  registration: "Registration", success: "Registration complete", kiosks: "Industry kiosks", venue: "Venue", travel: "Travel tips",
  sponsors: "Partners & sponsors", organisers: "Organisers", volunteers: "Volunteers (coming soon)", faq: "FAQ", answer: "FAQ: answer found",
  contact: "Contact form", notFound: "Page not found", sleep: "Footer", gallery: "Photo gallery", recordings: "Recordings", admin: "Admin panel", lecturer: "Posters and invitations", error: "Error page",
};

export default async function MeetAuraPage() {
  const s = await getSettings();
  const variants = (Object.keys(AURA_PRESETS) as AuraVariant[]).filter((v) => WHERE[v]);
  const hero = copy(s, "auraHero");
  const pg = copy(s, "auraPlayground");
  const lk = copy(s, "auraLooks", { count: variants.length });
  return (
    <TagScope style="corner">
      <PageHero edit="meetAura.hero" home={s.siteNav.home} tone={hero.tone} crumb={hero.crumb} eyebrow={hero.eyebrow} title={hero.title} aura="hero" description={hero.description} />
      <InOrder
        s={s}
        page="meetAura"
        sections={{
          playground: (
            <Section edit="meetAura.playground" tone={pg.tone} bg={pg.background} labelledBy="playground-title">
              <SectionHeading id="playground-title" eyebrow={pg.eyebrow} title={pg.title} description={pg.description} />
              <AuraPlayground />
            </Section>
          ),
          looks: (
            <Section edit="meetAura.looks" tone={lk.tone} bg={lk.background} labelledBy="looks-title">
              <SectionHeading id="looks-title" eyebrow={lk.eyebrow} title={lk.title} description={lk.description} />
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {variants.map((v) => (
                  <li key={v} data-glow="" className="card flex flex-col items-center p-4 text-center transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-lg">
                    <Aura variant={v} size={130} lite label={AURA_PRESETS[v].label} entrance="zip" />
                    <p className="mt-2 text-sm font-semibold text-fg">{WHERE[v]}</p>
                  </li>
                ))}
              </ul>
            </Section>
          ),
        }}
      />
    </TagScope>
  );
}
