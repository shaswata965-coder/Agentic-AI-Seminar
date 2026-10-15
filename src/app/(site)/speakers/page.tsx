import type { Metadata } from "next";
import { Aura } from "@/components/aura/Aura";
import { PageHero } from "@/components/layout/PageHero";
import { ScheduleArt } from "@/components/portals/PortalArt";
import { SpeakersView, type SpeakerSession } from "@/components/speakers/SpeakersView";
import { ButtonLink } from "@/components/ui/Button";
import { Portal } from "@/components/ui/Portal";
import { TagScope } from "@/components/ui/Tag";
import { getSessions, getSettings, getSpeakers } from "@/lib/content/queries";
import { copy } from "@/lib/copy";
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
  const hero = copy(s, "speakersHero");
  const list = copy(s, "speakersList");
  return (
    <TagScope style="ribbon">
      <PageHero edit="speakers.hero" home={s.siteNav.home} tone={hero.tone} crumb={hero.crumb} eyebrow={hero.eyebrow} title={hero.title} aura="speakers" description={hero.description}>
        <Portal href="/programme" tone="azure" compact kicker={hero.portalKicker} title={hero.portalTitle} text={hero.portalText} art={<ScheduleArt />} className="w-full max-w-md" />
      </PageHero>
      <section data-edit="speakers.list" className={`tone-${list.tone} py-12 sm:py-16`}>
        <div className="container-site">
          {speakers.length ? (
            <SpeakersView speakers={speakers} sessions={slim} showMore={s.showMoreSpeakers} more={{ title: s.homeSpeakers.moreTitle, text: s.homeSpeakers.moreText }} />
          ) : (
            <div className="card flex flex-col items-center gap-6 p-10 text-center sm:flex-row sm:text-left">
              <Aura variant="speakers" size={190} interactive />
              <div>
                <h2 className="font-display text-3xl font-bold text-fg">{list.emptyTitle}</h2>
                {list.emptyText ? <p className="mt-3 max-w-xl text-muted">{list.emptyText}</p> : null}
                {list.emptyButton ? (
                  <div className="mt-5">
                    <ButtonLink href="/#news" variant="soft">
                      {list.emptyButton}
                    </ButtonLink>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </section>
    </TagScope>
  );
}
