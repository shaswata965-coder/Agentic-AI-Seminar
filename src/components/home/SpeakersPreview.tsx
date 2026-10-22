import { Aura } from "@/components/aura/Aura";
import { FacesArt } from "@/components/portals/PortalArt";
import { ButtonLink } from "@/components/ui/Button";
import { Portal } from "@/components/ui/Portal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { SPEAKER_CATEGORY_META, THEME_META } from "@/lib/content/constants";
import type { SiteSettings, Speaker } from "@/lib/content/types";
import { copy, plural } from "@/lib/copy";
import { SpeakerCarousel, type SpeakerSlide } from "./SpeakerCarousel";

export function MoreSpeakersCard({ className, title, text }: { className?: string; title: string; text: string }) {
  return (
    <div className={`tone-lilac flex h-full min-h-[18rem] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[color-mix(in_oklab,var(--accent)_60%,transparent)] bg-accent-soft/60 p-6 text-center ${className ?? ""}`}>
      <Aura variant="speakers" size={120} lite />
      <p className="mt-3 font-display text-lg font-semibold text-fg">{title}</p>
      {text ? <p className="mt-1 text-sm text-muted">{text}</p> : null}
    </div>
  );
}

export function SpeakersPreview({ s, speakers }: { s: SiteSettings; speakers: Speaker[] }) {
  const limit = Math.max(0, s.featuredSpeakers || 8);
  const featured = speakers.filter((sp) => sp.featured);
  const list = (featured.length ? featured : speakers).slice(0, limit);
  const c = copy(s, "homeSpeakers", { count: plural(speakers.length, "speaker") });
  // Only what the cards show goes to the browser.
  const slides: SpeakerSlide[] = list.map((sp) => {
    const cat = SPEAKER_CATEGORY_META[sp.category] ?? SPEAKER_CATEGORY_META.academia;
    const theme = sp.theme && sp.theme !== "general" ? THEME_META[sp.theme] : undefined;
    return {
      id: sp.id,
      href: `/speakers?speaker=${encodeURIComponent(sp.slug)}`,
      name: sp.name,
      photo: sp.photo,
      designation: sp.designation,
      affiliation: sp.affiliation,
      keynote: sp.keynote,
      label: sp.keynote ? "Keynote" : cat.label,
      labelTone: sp.keynote ? "butter" : cat.tone,
      tone: cat.tone,
      theme: theme ? { label: theme.short, tone: theme.tone } : undefined,
      talkTitle: sp.talkTitle,
    };
  });
  return (
    <Section edit="home.speakers" tone={c.tone} bg={c.background} labelledBy="speakers-preview-title" tags="ribbon">
      <SectionHeading id="speakers-preview-title" eyebrow={c.eyebrow} title={c.title} description={c.description} align="center" className="sm:mb-8" />
      {slides.length ? (
        <SpeakerCarousel
          speakers={slides}
          label={c.eyebrow || "Speakers"}
          link={c.profile}
          more={
            s.showMoreSpeakers ? (
              // Opaque, so the cards it passes in front of don't show through.
              <div className="h-full overflow-hidden rounded-[1.75rem] bg-surface">
                <MoreSpeakersCard title={c.moreTitle} text={c.moreText} />
              </div>
            ) : undefined
          }
        />
      ) : (
        <div className="card flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left">
          <Aura variant="speakers" size={170} interactive />
          <div>
            <p className="font-display text-2xl font-bold text-fg">{c.emptyTitle}</p>
            {c.emptyText ? <p className="mt-2 max-w-xl text-muted">{c.emptyText}</p> : null}
            {c.emptyButton ? (
              <div className="mt-5">
                <ButtonLink href="/#news" variant="soft">
                  {c.emptyButton}
                </ButtonLink>
              </div>
            ) : null}
          </div>
        </div>
      )}
      <div className="mt-10 flex justify-center sm:mt-12">
        <Portal
          href="/speakers"
          tone={c.tone}
          kicker={c.portalKicker}
          title={speakers.length ? c.portalTitle : c.portalEmptyTitle}
          text={speakers.length ? c.portalText : c.portalEmptyText}
          art={<FacesArt people={speakers.slice(0, 3)} total={speakers.length} />}
          className="w-full max-w-xl"
        />
      </div>
    </Section>
  );
}
