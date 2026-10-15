import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { TutorialsView } from "@/components/tutorials/TutorialsView";
import { ButtonLink } from "@/components/ui/Button";
import { TagScope } from "@/components/ui/Tag";
import { getDemos, getSettings, getTutorials } from "@/lib/content/queries";
import { copy } from "@/lib/copy";
import { absoluteUrl } from "@/lib/paths";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: "Tutorials & Demos",
    description: `Hands-on tutorials and live demos at the ${s.eventName}: instructors, prerequisites and materials.`,
    alternates: { canonical: absoluteUrl("/tutorials") },
  };
}

export default async function TutorialsPage() {
  const [s, tutorials, demos] = await Promise.all([getSettings(), getTutorials(), getDemos()]);
  const hero = copy(s, "tutorialsHero");
  return (
    <TagScope style="tab">
      <PageHero edit="tutorials.hero" home={s.siteNav.home} tone={hero.tone} crumb={hero.crumb} eyebrow={hero.eyebrow} title={hero.title} aura="tutorials" description={hero.description}>
        {hero.tutorialsButton ? (
          <ButtonLink href="#tutorials" variant="soft">
            {hero.tutorialsButton}
          </ButtonLink>
        ) : null}
        {hero.demosButton ? (
          <ButtonLink href="#demos" variant="outline">
            {hero.demosButton}
          </ButtonLink>
        ) : null}
      </PageHero>
      <div data-edit="tutorials.list" className={`tone-${s.tutorialsList.tone} py-12 sm:py-16`}>
        <div className="container-site">
          <TutorialsView tutorials={tutorials} demos={demos} />
        </div>
      </div>
    </TagScope>
  );
}
