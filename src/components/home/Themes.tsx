import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Aura } from "@/components/aura/Aura";
import { Tilt } from "@/components/effects/Tilt";
import { Section, SectionHeading } from "@/components/ui/Section";
import { THEME_META } from "@/lib/content/constants";
import type { SiteSettings } from "@/lib/content/types";

export function Themes({ s }: { s: SiteSettings }) {
  return (
    <Section id="themes" tone="lilac" labelledBy="themes-title" band>
      <SectionHeading
        id="themes-title"
        eyebrow="Themes"
        title="Three themes, one question: what can agents do for us?"
        description="Talks, tutorials and hackathon tracks are organised around three themes."
        align="center"
      />
      <ul className="grid gap-6 lg:grid-cols-3">
        {s.themes.map((t, i) => {
          const meta = THEME_META[t.key] ?? THEME_META.general;
          return (
            <li key={t.key} data-reveal style={{ ["--reveal-delay" as string]: `${i * 110}ms` }}>
              <Tilt className="h-full">
                <article className={`tone-${meta.tone} card relative flex h-full flex-col overflow-hidden p-6 sm:p-7`}>
                  <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_var(--mx,70%)_var(--my,0%),color-mix(in_oklab,var(--accent)_30%,transparent),transparent_70%)]" />
                  <div className="relative flex items-start justify-between gap-4">
                    <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold tracking-[0.12em] text-accent-ink uppercase">Theme {i + 1}</span>
                    <span aria-hidden className="font-display text-6xl leading-none font-black text-[color-mix(in_oklab,var(--accent)_45%,transparent)]">
                      0{i + 1}
                    </span>
                  </div>
                  <div className="relative mx-auto my-4">
                    <Aura variant={meta.aura} size={168} interactive bubbleSide={i === 2 ? "left" : "right"} />
                  </div>
                  <h3 className="relative font-display text-2xl font-bold text-fg">{t.title}</h3>
                  <p className="relative mt-3 text-[15.5px] leading-relaxed text-muted">{t.description}</p>
                  <ul className="relative mt-6 grid gap-2 border-t border-border pt-5 text-sm font-semibold">
                    {[
                      { href: `/programme?theme=${t.key}`, label: "Related talks & panels" },
                      { href: `/tutorials?theme=${t.key}`, label: "Tutorials & demos" },
                      { href: `/hackathon#track-${t.key}`, label: "Hackathon track" },
                    ].map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="group flex items-center justify-between rounded-xl px-3 py-2 text-accent-ink transition-colors hover:bg-accent-soft">
                          {l.label}
                          <ArrowRight size={16} aria-hidden className="transition-transform group-hover:translate-x-1" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </article>
              </Tilt>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
