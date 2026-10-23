import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Aura } from "@/components/aura/Aura";
import { Tilt } from "@/components/effects/Tilt";
import { Img } from "@/components/ui/Img";
import { Section, SectionHeading } from "@/components/ui/Section";
import { cn } from "@/lib/cn";
import { THEME_META } from "@/lib/content/constants";
import type { SiteSettings } from "@/lib/content/types";
import { copy } from "@/lib/copy";
import { hackathonShown } from "@/lib/event";

type Theme = SiteSettings["themes"][number];

/** The built-in photos (public/themes), shown until another is uploaded in Site settings → Home → Themes. */
const THEME_PHOTOS: Record<Theme["key"], string> = {
  healthcare: "/themes/healthcare.webp",
  science: "/themes/science.webp",
  enterprise: "/themes/enterprise.webp",
};

/** A theme card's photo: the one uploaded for it, or the built-in one. */
export const themePhoto = (t: Theme): string | undefined => t.image || THEME_PHOTOS[t.key];

/**
 * The workshop's three themes as cards, each with its photo across the top and Aura, dressed for the theme, stepping
 * out of its lower edge across from the theme's number. A theme without a photo shows Aura on her own. Under them, a
 * note sets the hackathon apart: it doesn't split into themes, every team answers one question.
 */
export function Themes({ s }: { s: SiteSettings }) {
  const c = copy(s, "homeThemes");
  return (
    <Section id="themes" edit="home.themes" tone={c.tone} bg={c.background} labelledBy="themes-title" tags="corner">
      <SectionHeading
        id="themes-title"
        eyebrow={c.eyebrow}
        title={c.title}
        description={c.description}
        align="center"
      />
      <ul className="grid gap-6 lg:grid-cols-3">
        {s.themes.map((t, i) => {
          const meta = THEME_META[t.key] ?? THEME_META.general;
          const tag = <span className="tag tag-eyebrow">{c.theme ? `${c.theme} ${i + 1}` : i + 1}</span>;
          const bubbleSide = i === 2 ? "left" : "right";
          const photo = themePhoto(t);
          return (
            <li key={t.key} data-reveal style={{ ["--reveal-delay" as string]: `${i * 110}ms` }}>
              <Tilt className="h-full">
                <article className={`tone-${meta.tone} card group relative flex h-full flex-col overflow-hidden`}>
                  <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_var(--mx,70%)_var(--my,0%),color-mix(in_oklab,var(--accent)_30%,transparent),transparent_70%)]" />
                  {photo ? (
                    // The photo fades out at the bottom, so it melts into the card.
                    <div className="relative aspect-[16/9] shrink-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_58%,transparent)]">
                      <Img src={photo} alt="" width={1280} height={720} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                      {/* A little darker at the top, behind the label. */}
                      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(15_23_42/0.3),transparent_30%)]" />
                      <div className="absolute top-0 left-0 p-5">{tag}</div>
                    </div>
                  ) : null}
                  <div className={cn("relative flex flex-1 flex-col p-6 sm:p-7", photo && "pt-0 sm:pt-0")}>
                    {photo ? (
                      // Aura and the number sit across from each other where the photo fades out, clear of what it shows.
                      <div className="relative -mt-16 mb-1 flex items-end justify-between gap-4">
                        <Aura variant={meta.aura} size={112} interactive bubbleSide={bubbleSide} />
                        <span aria-hidden className="pb-3 font-display text-6xl leading-none font-black text-[color-mix(in_oklab,var(--accent)_55%,transparent)]">
                          0{i + 1}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="relative flex items-start justify-between gap-4">
                          {tag}
                          <span aria-hidden className="font-display text-6xl leading-none font-black text-[color-mix(in_oklab,var(--accent)_45%,transparent)]">
                            0{i + 1}
                          </span>
                        </div>
                        <div className="relative mx-auto my-4">
                          <Aura variant={meta.aura} size={168} interactive bubbleSide={bubbleSide} />
                        </div>
                      </>
                    )}
                    <h3 className="relative font-display text-2xl font-bold text-fg">{t.title}</h3>
                    <p className="relative mt-3 text-[15.5px] leading-relaxed text-muted">{t.description}</p>
                    <ul className="relative mt-6 grid gap-2 border-t border-border pt-5 text-sm font-semibold">
                      {[
                        { href: `/programme?theme=${t.key}`, label: c.talks },
                        { href: `/tutorials?theme=${t.key}`, label: c.tutorials },
                      ]
                        .filter((l) => l.label)
                        .map((l) => (
                        <li key={l.href}>
                          <Link href={l.href} className="group/link flex items-center justify-between rounded-xl px-3 py-2 text-accent-ink transition-colors hover:bg-accent-soft">
                            {l.label}
                            <ArrowRight size={16} aria-hidden className="transition-transform group-hover/link:translate-x-1" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Tilt>
            </li>
          );
        })}
      </ul>
      {c.hackathonNote && hackathonShown(s) ? (
        <p className="tone-aqua mx-auto mt-10 flex w-fit max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-2xl bg-surface/80 px-4 py-3 text-center text-[15px] text-muted ring-1 ring-border backdrop-blur sm:px-5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-soft font-display text-lg leading-none font-black text-accent-ink" aria-hidden>
            1
          </span>
          <span>{c.hackathonNote}</span>
          {c.hackathonLink ? (
            <Link href="/hackathon#challenge" className="group/link inline-flex items-center gap-1 font-semibold text-accent-ink">
              <span className="mi-underline">{c.hackathonLink}</span>
              <ArrowRight size={15} aria-hidden className="transition-transform group-hover/link:translate-x-1" />
            </Link>
          ) : null}
        </p>
      ) : null}
    </Section>
  );
}
