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

/**
 * The three themes as cards. A theme with a photo (Site settings → Home → Themes) shows it across the top,
 * with its number on it and Aura, dressed for the theme, stepping out of its lower edge; one without shows
 * Aura on her own.
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
          return (
            <li key={t.key} data-reveal style={{ ["--reveal-delay" as string]: `${i * 110}ms` }}>
              <Tilt className="h-full">
                <article className={`tone-${meta.tone} card group relative flex h-full flex-col overflow-hidden`}>
                  <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_var(--mx,70%)_var(--my,0%),color-mix(in_oklab,var(--accent)_30%,transparent),transparent_70%)]" />
                  {t.image ? (
                    // The photo fades out at the bottom, so it melts into the card.
                    <div className="relative aspect-[16/9] shrink-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_58%,transparent)]">
                      <Img src={t.image} alt="" width={1280} height={720} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                      {/* Darker at the top, for the label and the number. */}
                      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(15_23_42/0.4),transparent_38%)]" />
                      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5">
                        {tag}
                        <span aria-hidden className="font-display text-5xl leading-none font-black text-white/90 drop-shadow-[0_2px_8px_rgb(15_23_42/0.45)]">
                          0{i + 1}
                        </span>
                      </div>
                    </div>
                  ) : null}
                  <div className={cn("relative flex flex-1 flex-col p-6 sm:p-7", t.image && "pt-0 sm:pt-0")}>
                    {t.image ? (
                      <div className="relative -mt-16 mb-1 self-start">
                        <Aura variant={meta.aura} size={112} interactive bubbleSide={bubbleSide} />
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
                        { href: `/hackathon#theme-${t.key}`, label: c.track },
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
    </Section>
  );
}
