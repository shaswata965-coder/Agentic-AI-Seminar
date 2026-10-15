import { Star } from "lucide-react";
import { Aura } from "@/components/aura/Aura";
import { FacesArt } from "@/components/portals/PortalArt";
import { ButtonLink } from "@/components/ui/Button";
import { PersonCard } from "@/components/ui/PersonCard";
import { Portal } from "@/components/ui/Portal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { SPEAKER_CATEGORY_META } from "@/lib/content/constants";
import type { SiteSettings, Speaker } from "@/lib/content/types";
import { copy, plural } from "@/lib/copy";

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
  return (
    <Section edit="home.speakers" tone={c.tone} bg={c.background} labelledBy="speakers-preview-title" tags="ribbon">
      <SectionHeading
        id="speakers-preview-title"
        eyebrow={c.eyebrow}
        title={c.title}
        description={c.description}
      />
      {list.length ? (
        <ul className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {list.map((sp, i) => {
            const cat = SPEAKER_CATEGORY_META[sp.category] ?? SPEAKER_CATEGORY_META.academia;
            return (
              <li key={sp.id} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 4) * 80}ms` }}>
                <PersonCard
                  action={{ href: `/speakers?speaker=${encodeURIComponent(sp.slug)}` }}
                  name={sp.name}
                  photo={sp.photo}
                  title={sp.designation}
                  subtitle={sp.affiliation}
                  label={sp.keynote ? "Keynote" : cat.label}
                  labelTone={sp.keynote ? "butter" : cat.tone}
                  className={`tone-${cat.tone}`}
                  highlight={
                    sp.keynote ? (
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-butter text-[#5b3d00] shadow-card ring-2 ring-surface">
                        <Star size={15} aria-hidden fill="currentColor" />
                      </span>
                    ) : null
                  }
                  footer={sp.talkTitle ? <p className="line-clamp-2 text-sm font-medium text-accent-ink">“{sp.talkTitle}”</p> : null}
                />
              </li>
            );
          })}
          {s.showMoreSpeakers ? (
            <li>
              <MoreSpeakersCard title={c.moreTitle} text={c.moreText} />
            </li>
          ) : null}
        </ul>
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
