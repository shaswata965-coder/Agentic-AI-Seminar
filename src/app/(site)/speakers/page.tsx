import type { Metadata } from "next";
import { Aura } from "@/components/aura/Aura";
import { PageHero } from "@/components/layout/PageHero";
import { SpeakersView, type SpeakerSession } from "@/components/speakers/SpeakersView";
import { ButtonLink } from "@/components/ui/Button";
import { TagScope } from "@/components/ui/Tag";
import { getSessions, getSettings, getSpeakers } from "@/lib/content/queries";
import { eventDayLabel } from "@/lib/format";
import { absoluteUrl } from "@/lib/paths";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: "Speakers",
    description: `Academic and industry speakers and panelists at the ${s.eventName}, IIT Delhi.`,
    alternates: { canonical: absoluteUrl("/speakers") },
  };
}

export default async function SpeakersPage() {
  const [s, speakers, sessions] = await Promise.all([getSettings(), getSpeakers(), getSessions()]);
  const showSessions = s.programmeStatus !== "tba";
  const slim: SpeakerSession[] = (showSessions ? sessions : []).map((x) => ({
    id: x.id,
    title: x.title,
    type: x.type,
    theme: x.theme,
    day: x.day,
    start: x.start,
    end: x.end,
    room: x.room,
    speakers: x.speakers,
    panelists: x.panelists,
    moderator: x.moderator,
    dayLabel: eventDayLabel(s.startDate, x.day),
  }));
  return (
    <TagScope style="ribbon">
      <PageHero
        tone="lilac"
        crumb="Speakers"
        eyebrow="Speakers"
        title="Speakers & panelists"
        aura="speakers"
        description={<p>Researchers, practitioners and founders shaping agentic AI. Tap a card to read the bio, talk title and abstract.</p>}
      >
        <ButtonLink href="/programme" variant="outline">
          See the programme
        </ButtonLink>
      </PageHero>
      <section className="tone-lilac py-12 sm:py-16">
        <div className="container-site">
          {speakers.length ? (
            <SpeakersView speakers={speakers} sessions={slim} showMore={s.showMoreSpeakers} />
          ) : (
            <div className="card flex flex-col items-center gap-6 p-10 text-center sm:flex-row sm:text-left">
              <Aura variant="speakers" size={190} interactive />
              <div>
                <h2 className="font-display text-3xl font-bold text-fg">More speakers to be announced</h2>
                <p className="mt-3 max-w-xl text-muted">
                  We&apos;re finalising keynote speakers, invited talks and panelists from academia and industry. Their profiles, talk titles and abstracts will appear here as they are confirmed.
                </p>
                <div className="mt-5">
                  <ButtonLink href="/#news" variant="soft">
                    Follow the announcements
                  </ButtonLink>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </TagScope>
  );
}
