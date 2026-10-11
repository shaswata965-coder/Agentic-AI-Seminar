import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { Aura } from "@/components/aura/Aura";
import { ButtonLink } from "@/components/ui/Button";
import { PersonCard } from "@/components/ui/PersonCard";
import { Section, SectionHeading } from "@/components/ui/Section";
import { SPEAKER_CATEGORY_META } from "@/lib/content/constants";
import type { SiteSettings, Speaker } from "@/lib/content/types";

export function MoreSpeakersCard({ className }: { className?: string }) {
  return (
    <div className={`tone-lilac flex h-full min-h-[18rem] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[color-mix(in_oklab,var(--accent)_60%,transparent)] bg-accent-soft/60 p-6 text-center ${className ?? ""}`}>
      <Aura variant="speakers" size={120} lite />
      <p className="mt-3 font-display text-lg font-semibold text-fg">More speakers to be announced</p>
      <p className="mt-1 text-sm text-muted">New names are added as they confirm. Stay tuned!</p>
    </div>
  );
}

export function SpeakersPreview({ s, speakers }: { s: SiteSettings; speakers: Speaker[] }) {
  const limit = Math.max(0, s.featuredSpeakers || 8);
  const featured = speakers.filter((sp) => sp.featured);
  const list = (featured.length ? featured : speakers).slice(0, limit);
  return (
    <Section tone="lilac" labelledBy="speakers-preview-title" wash>
      <SectionHeading
        id="speakers-preview-title"
        eyebrow="Speakers"
        title="Voices from academia and industry"
        description="Invited talks and panel discussions from researchers, practitioners and founders building agentic AI."
        aside={
          <ButtonLink href="/speakers" variant="outline" iconRight={<ArrowRight size={17} aria-hidden />}>
            All speakers
          </ButtonLink>
        }
      />
      {list.length ? (
        <ul className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {list.map((sp, i) => {
            const cat = SPEAKER_CATEGORY_META[sp.category] ?? SPEAKER_CATEGORY_META.academia;
            return (
              <li key={sp.id} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 4) * 80}ms` }}>
                <Link href={`/speakers?speaker=${encodeURIComponent(sp.slug)}`} className="block h-full rounded-3xl" aria-label={`${sp.name} — view profile`}>
                  <PersonCard
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
                </Link>
              </li>
            );
          })}
          {s.showMoreSpeakers ? (
            <li>
              <MoreSpeakersCard />
            </li>
          ) : null}
        </ul>
      ) : (
        <div className="card flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left">
          <Aura variant="speakers" size={170} interactive />
          <div>
            <p className="font-display text-2xl font-bold text-fg">Speakers will be announced soon</p>
            <p className="mt-2 max-w-xl text-muted">
              We are finalising an exciting line-up of keynote speakers, invited talks and panelists from academia and industry. Follow the announcements for updates.
            </p>
            <div className="mt-5">
              <ButtonLink href="/#news" variant="soft">
                See announcements
              </ButtonLink>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
