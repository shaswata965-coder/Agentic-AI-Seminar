import { FileText } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Aura } from "@/components/aura/Aura";
import { PageHero } from "@/components/layout/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { VideoEmbed } from "@/components/ui/VideoEmbed";
import { getSettings, getTalks } from "@/lib/content/queries";
import { eventDayLabel } from "@/lib/format";
import { absoluteUrl } from "@/lib/paths";

export const metadata: Metadata = { title: "Slides & recordings", alternates: { canonical: absoluteUrl("/talks") } };

export default async function TalksPage() {
  const [s, talks] = await Promise.all([getSettings(), getTalks()]);
  if (!s.showTalks) notFound();
  return (
    <>
      <PageHero tone="lilac" crumb="Slides & recordings" eyebrow="Post-event" title="Talk slides & recordings" aura="recordings" description={<p>Catch up on the talks from the {s.eventName}.</p>} />
      <section className="tone-lilac py-12 sm:py-16">
        <div className="container-site">
          {talks.length ? (
            <ul className="grid gap-6 md:grid-cols-2">
              {talks.map((t) => (
                <li key={t.id} data-glow="" className="card flex flex-col overflow-hidden transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-lg">
                  {t.videoUrl ? (
                    <div className="p-3 pb-0">
                      <VideoEmbed url={t.videoUrl} title={t.title} />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-6">
                    {t.day ? <p className="text-xs font-bold tracking-[0.12em] text-subtle uppercase">{eventDayLabel(s.startDate, t.day)}</p> : null}
                    <h2 className="mt-1 font-display text-xl font-semibold text-fg">{t.title}</h2>
                    {t.speakerName ? <p className="text-sm font-semibold text-accent-ink">{t.speakerName}</p> : null}
                    {t.description ? <p className="mt-2 text-sm text-muted">{t.description}</p> : null}
                    {t.slides ? (
                      <div className="mt-auto pt-4">
                        <ButtonLink href={t.slides} variant="outline" size="sm" icon={<FileText size={16} aria-hidden />} {...(t.slides.startsWith("/") ? { download: "" } : {})}>
                          Slides
                        </ButtonLink>
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="card flex flex-col items-center p-10 text-center">
              <Aura variant="recordings" size={150} />
              <p className="mt-3 font-display text-xl font-semibold text-fg">Recordings will be published soon.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
