"use client";

import { Check } from "lucide-react";
import { AuraHead } from "@/components/aura/AuraHead";
import { useNow } from "@/components/home/Countdown";
import { cn } from "@/lib/cn";
import type { HackathonInfo } from "@/lib/content/types";
import { formatDate } from "@/lib/format";

/** Hackathon milestones; Aura marks the current stage once dates are known. */
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
    <div className="relative">
      {/* Desktop: horizontal track */}
      <div aria-hidden className="absolute top-7 right-[8%] left-[8%] hidden h-1.5 rounded-full bg-border lg:block">
        <div className="h-full origin-left rounded-full bg-[linear-gradient(90deg,var(--mint),var(--aqua),var(--lilac))] transition-transform duration-1000" style={{ transform: `scaleX(${current < 0 ? 0.02 : progress})` }} />
      </div>
      <ol className="relative grid gap-4 lg:grid-cols-6 lg:gap-3">
        {items.map((m, i) => {
          const done = i < current;
          const here = i === current;
          const label = m.dateLabel || (m.date ? formatDate(`${m.date}T12:00:00+05:30`, { day: "numeric", month: "short", year: "numeric" }) : "TBA");
          return (
            <li key={`${m.label}-${i}`} className="group relative flex gap-4 lg:flex-col lg:items-center lg:gap-3 lg:text-center">
              {i < items.length - 1 ? <span aria-hidden className="absolute top-14 bottom-[-1rem] left-7 w-0.5 bg-border lg:hidden" /> : null}
              <span
                className={cn(
                  "relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border-4 border-bg font-display text-lg font-bold shadow-card transition-[background-color,color,scale] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110",
                  here ? "bg-[var(--aqua)] text-[#0f172a]" : done ? "bg-[var(--mint)] text-[#0f172a]" : "bg-surface text-subtle ring-1 ring-border",
                )}
              >
                {here ? <AuraHead size={34} /> : done ? <Check size={22} aria-hidden /> : i + 1}
                {here ? <span className="absolute inset-0 animate-ping-soft rounded-full bg-[var(--aqua)] opacity-40" aria-hidden /> : null}
              </span>
              <div data-glow="" className="card min-w-0 flex-1 p-4 transition-[translate,box-shadow] duration-300 group-hover:-translate-y-1 group-hover:shadow-card-lg lg:w-full">
                <p className={cn("text-xs font-bold tracking-[0.12em] uppercase", label === "TBA" ? "text-subtle" : "text-aqua-ink")}>{label}</p>
                <p className="mt-1 font-display text-[15.5px] leading-snug font-semibold text-fg">{m.label}</p>
                {m.description ? <p className="mt-1 text-sm text-muted">{m.description}</p> : null}
                {here ? <p className="mt-2 text-xs font-bold text-aqua-ink">← We are here</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
