"use client";

import { Check } from "lucide-react";
import { AuraHead } from "@/components/aura/AuraHead";
import { useNow } from "@/components/home/Countdown";
import { cn } from "@/lib/cn";
import type { HackathonInfo } from "@/lib/content/types";
import { formatDate } from "@/lib/format";

/**
 * Hackathon milestones down a line that fills up to the current stage, where Aura marks it once dates are
 * known. Phones: the line on the left, the stages beside it. Wider screens: the line in the middle, the
 * stages taking turns on either side with their dates in large type opposite.
 */
export function HackathonTimeline({ items }: { items: HackathonInfo["timeline"] }) {
  const now = useNow();
  const times = items.map((m) => (m.date ? Date.parse(`${m.date}T00:00:00+05:30`) : NaN));
  let current = -1;
  if (now !== null) {
    times.forEach((t, i) => {
      if (!Number.isNaN(t) && t <= now) current = i;
    });
  }
  const progress = items.length > 1 ? Math.max(0, current) / (items.length - 1) : 0;

  return (
    <div className="relative mx-auto max-w-5xl">
      <div aria-hidden className="absolute top-7 bottom-7 left-7 w-1.5 -translate-x-1/2 overflow-hidden rounded-full bg-border md:left-1/2">
        <div className="h-full origin-top rounded-full bg-[linear-gradient(180deg,var(--mint),var(--aqua),var(--lilac))] transition-transform duration-1000" style={{ transform: `scaleY(${current < 0 ? 0.02 : progress})` }} />
      </div>
      <ol className="relative grid gap-6 md:gap-4">
        {items.map((m, i) => {
          const done = i < current;
          const here = i === current;
          const left = i % 2 === 0;
          const label = m.dateLabel || (m.date ? formatDate(`${m.date}T12:00:00+05:30`, { day: "numeric", month: "short", year: "numeric" }) : "TBA");
          const tba = label === "TBA";
          return (
            <li key={`${m.label}-${i}`} data-reveal="" className="group relative grid grid-cols-[3.5rem_1fr] items-center gap-x-4 md:grid-cols-[1fr_3.5rem_1fr] md:gap-x-8">
              <span
                className={cn(
                  "relative z-10 col-start-1 row-start-1 grid h-14 w-14 place-items-center self-start rounded-full border-4 border-bg font-display text-lg font-bold shadow-card transition-[background-color,color,scale] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 md:col-start-2 md:self-center",
                  here ? "bg-[var(--aqua)] text-[#0f172a]" : done ? "bg-[var(--mint)] text-[#0f172a]" : "bg-surface text-subtle ring-1 ring-border",
                )}
              >
                {here ? <AuraHead size={34} /> : done ? <Check size={22} aria-hidden /> : i + 1}
                {here ? <span className="absolute inset-0 animate-ping-soft rounded-full bg-[var(--aqua)] opacity-40" aria-hidden /> : null}
              </span>
              <div
                data-glow=""
                className={cn(
                  "card relative col-start-2 row-start-1 min-w-0 p-5 transition-[translate,box-shadow] duration-300 group-hover:-translate-y-1 group-hover:shadow-card-lg",
                  left ? "md:col-start-1 md:text-right" : "md:col-start-3",
                  here && "ring-2 ring-[var(--aqua)]",
                )}
              >
                <p className={cn("text-xs font-bold tracking-[0.12em] uppercase md:sr-only", tba ? "text-subtle" : "text-aqua-ink")}>{label}</p>
                <p className="mt-1 font-display text-lg leading-snug font-semibold text-fg md:mt-0">{m.label}</p>
                {m.description ? <p className="mt-1 text-sm text-muted">{m.description}</p> : null}
                {here ? <p className="mt-2 text-xs font-bold text-aqua-ink">We are here</p> : null}
              </div>
              <p aria-hidden className={cn("row-start-1 hidden font-display font-bold md:block", left ? "md:col-start-3" : "md:col-start-1 md:text-right", tba ? "text-xl text-subtle" : "text-2xl text-aqua-ink")}>
                {label}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
