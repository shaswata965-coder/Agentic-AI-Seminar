import type { CSSProperties } from "react";
import { CmsIcon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { SiteSettings } from "@/lib/content/types";
import { StatValue } from "./StatValue";

const TONES = ["azure", "lilac", "mint", "peach", "butter", "blush"] as const;

/** The highlight figures as one tear-off ticket: notched stubs joined by perforated seams. */
export function Highlights({ s }: { s: SiteSettings }) {
  if (!s.highlights.length) return null;
  const odd = s.highlights.length % 2 === 1;
  return (
    <section aria-label="Workshop highlights" className="container-site relative z-10 py-8 sm:py-10">
      <div className="drop-shadow-[0_16px_22px_rgb(30_41_59/0.12)] dark:drop-shadow-[0_16px_26px_rgb(0_0_0/0.55)]">
        <ul className="grid grid-cols-2 gap-y-3 sm:grid-cols-3 lg:flex lg:gap-y-0">
          <li aria-hidden className="ticket-stub hidden w-16 shrink-0 items-center justify-center bg-[linear-gradient(180deg,var(--brand),color-mix(in_oklab,var(--brand)_55%,var(--lilac)))] lg:flex">
            <span className="font-mono text-[11px] font-bold tracking-[0.3em] whitespace-nowrap text-brand-fg uppercase [writing-mode:vertical-rl] rotate-180">At a glance</span>
          </li>
          {s.highlights.map((h, i) => (
            <li
              key={`${h.label}-${i}`}
              data-reveal
              style={{ "--reveal-delay": `${i * 70}ms` } as CSSProperties}
              className={cn(
                `tone-${TONES[i % TONES.length]}`,
                "ticket-stub group relative min-w-0 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--accent-soft)_85%,var(--surface)),var(--surface)_65%)] px-5 pt-4 pb-5 ring-1 ring-border ring-inset lg:flex-1",
                i === s.highlights.length - 1 && odd && "col-span-2 sm:col-span-1",
              )}
            >
              {/* Tear line between stubs. */}
              {i > 0 ? <span aria-hidden className="absolute top-4 bottom-4 left-0 hidden border-l-2 border-dashed border-border-strong sm:block" /> : null}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold tracking-[0.15em] text-subtle">No. {String(i + 1).padStart(2, "0")}</span>
                <span className="text-accent-ink transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-125 group-hover:-rotate-12">
                  <CmsIcon name={h.icon} size={20} />
                </span>
              </div>
              <p className="mt-5 font-display text-[2.1rem] leading-none font-extrabold tracking-tight text-accent-ink sm:text-[2.5rem]">
                <StatValue value={h.value} />
              </p>
              <p className="mt-2 font-mono text-[11px] font-bold tracking-[0.16em] text-muted uppercase">{h.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
