import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { Aura } from "@/components/aura/Aura";
import { ButtonLink } from "@/components/ui/Button";
import { CmsIcon } from "@/components/ui/Icon";
import { Eyebrow, Section } from "@/components/ui/Section";
import type { SiteSettings } from "@/lib/content/types";

const TONES = ["azure", "lilac", "mint", "peach", "butter", "blush"] as const;

/**
 * Home page About: Aura in the middle with the short "about points" (Site settings → About & themes)
 * on an orbit around her. The full About text lives on /about.
 * --rx / --ry are the orbit's radii; each point's centre sits on that ellipse.
 */
export function About({ s }: { s: SiteSettings }) {
  const points = s.aboutPoints.slice(0, 6);
  return (
    <Section id="about" tone="mint" wash labelledBy="about-title" tags="underline">
      <div className="text-center">
        <Eyebrow>About the workshop</Eyebrow>
        <h2 id="about-title" className="sr-only">
          About the workshop
        </h2>
      </div>

      <div className="about-orbit relative mx-auto mt-6 aspect-[10/11] w-full max-w-[26rem] [--rx:37%] [--ry:35%] sm:aspect-[16/11] sm:max-w-none sm:[--rx:38%] sm:[--ry:34%] lg:aspect-[16/9] lg:[--rx:39%] lg:[--ry:34%]">
        {/* Orbit rings, a soft glow and two travelling sparks. */}
        <div aria-hidden className="absolute top-[calc(50%-var(--ry))] left-[calc(50%-var(--rx))] h-[calc(2*var(--ry))] w-[calc(2*var(--rx))] rounded-[50%] border-2 border-dashed border-border-strong opacity-70" />
        <div aria-hidden className="absolute top-[calc(50%-var(--ry)*0.48)] left-[calc(50%-var(--rx)*0.48)] h-[calc(0.96*var(--ry))] w-[calc(0.96*var(--rx))] rounded-[50%] border border-border" />
        <div aria-hidden className="absolute top-1/2 left-1/2 h-[46%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--mint)_45%,transparent),color-mix(in_oklab,var(--lilac)_25%,transparent)_60%,transparent)] blur-xl" />
        <span aria-hidden className="orbit-spark" />
        <span aria-hidden className="orbit-spark" />

        <div className="absolute inset-0 grid place-items-center">
          <Aura variant="thinker" size={210} interactive overrides={{ effects: [] }} className="max-w-[34%]" />
        </div>

        <ul>
          {points.map((p, i) => {
            const a = ((-90 + (i * 360) / points.length) * Math.PI) / 180;
            return (
              <li
                key={`${p.title}-${i}`}
                className={`tone-${TONES[i % TONES.length]} absolute flex w-[7.25rem] -translate-x-1/2 -translate-y-6 flex-col items-center text-center sm:w-48 sm:-translate-y-7`}
                style={{ left: `calc(50% + ${Math.cos(a).toFixed(4)} * var(--rx))`, top: `calc(50% + ${Math.sin(a).toFixed(4)} * var(--ry))` } as CSSProperties}
              >
                <div data-reveal style={{ "--reveal-delay": `${i * 80}ms` } as CSSProperties} className="group flex flex-col items-center">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-surface text-accent-ink shadow-card ring-2 ring-[color-mix(in_oklab,var(--accent)_70%,transparent)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 sm:h-14 sm:w-14">
                    <CmsIcon name={p.icon} size={22} />
                  </span>
                  <p className="mt-2 font-display text-[15px] leading-tight font-semibold text-fg sm:text-base">{p.title}</p>
                  {p.description ? <p className="mt-1 hidden text-sm leading-snug text-muted sm:block">{p.description}</p> : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-4 flex justify-center sm:mt-2">
        <ButtonLink href="/about" variant="outline" iconRight={<ArrowRight size={17} aria-hidden />}>
          More about the workshop
        </ButtonLink>
      </div>
    </Section>
  );
}
