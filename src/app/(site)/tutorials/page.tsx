import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { TutorialsView } from "@/components/tutorials/TutorialsView";
import { ButtonLink } from "@/components/ui/Button";
import { getDemos, getSettings, getTutorials } from "@/lib/content/queries";
import { absoluteUrl } from "@/lib/paths";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: "Tutorials & Demos",
    description: `Hands-on tutorials and live demos at the ${s.eventName} — instructors, prerequisites and materials.`,
    alternates: { canonical: absoluteUrl("/tutorials") },
  };
}

export default async function TutorialsPage() {
  const [tutorials, demos] = await Promise.all([getTutorials(), getDemos()]);
  return (
    <>
      <PageHero
        tone="mint"
        crumb="Tutorials & Demos"
        eyebrow="Learn by doing"
        title="Tutorials & Demos"
        aura="tutorials"
        description={<p>Hands-on sessions on building and evaluating agents, plus live demos from research labs and companies. Check prerequisites before you arrive.</p>}
      >
        <ButtonLink href="#tutorials" variant="soft">
          Tutorials
        </ButtonLink>
        <ButtonLink href="#demos" variant="outline">
          Demos
        </ButtonLink>
      </PageHero>
      <div className="tone-mint py-12 sm:py-16">
        <div className="container-site">
          <TutorialsView tutorials={tutorials} demos={demos} />
        </div>
      </div>
    </>
  );
}
