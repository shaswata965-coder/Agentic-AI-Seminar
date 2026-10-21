import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Aura } from "@/components/aura/Aura";
import { cn } from "@/lib/cn";
import { THEME_META } from "@/lib/content/constants";
import type { HackathonInfo } from "@/lib/content/types";

/**
 * The hackathon's themes as points under a label saying they make one hackathon. Each point is led by Aura
 * dressed for its theme (stethoscope, flask, rocket…), the Auras joined by a dashed trace, and links to the
 * theme on the Hackathon page.
 */
export function ThemePoints({ tracks, label, className }: { tracks: HackathonInfo["tracks"]; label: string; className?: string }) {
  if (!tracks.length) return null;
  return (
    <div className={className}>
      {label ? <p className="text-xs font-bold tracking-[0.14em] text-subtle uppercase">{label}</p> : null}
      <ul className="relative mt-3 grid max-w-lg gap-2.5">
        {tracks.length > 1 ? <span aria-hidden className="absolute top-8 bottom-8 left-[1.85rem] border-l-2 border-dashed border-border-strong" /> : null}
        {tracks.map((t) => {
          const meta = THEME_META[t.theme] ?? THEME_META.general;
          return (
            <li key={t.title} className={`tone-${meta.tone}`}>
              <Link
                href={`/hackathon#theme-${t.theme}`}
                className={cn(
                  "group relative flex items-center gap-3 rounded-2xl bg-surface/85 py-1 pr-4 pl-1.5 ring-1 ring-border backdrop-blur",
                  "transition-[translate,box-shadow,background-color] duration-300 hover:translate-x-1 hover:bg-surface hover:shadow-card hover:ring-[color-mix(in_oklab,var(--accent)_60%,transparent)]",
                )}
              >
                <span className="grid h-14 w-12 shrink-0 place-items-center rounded-xl bg-accent-soft">
                  <Aura variant={meta.aura} size={46} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold tracking-[0.12em] text-accent-ink uppercase">{meta.short}</span>
                  <span className="block font-display text-[15.5px] leading-snug font-semibold text-fg">{t.title}</span>
                </span>
                <ArrowRight size={17} aria-hidden className="shrink-0 text-accent-ink transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
