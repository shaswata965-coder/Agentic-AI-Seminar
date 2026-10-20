"use client";

import { Fragment, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

// A shared 1-second clock. The server snapshot is null so the countdown never
// renders a server time (no hydration mismatch, no prerender clock access).
let now = 0;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (!listeners.size && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}
const getSnapshot = () => {
  if (!now) now = Date.now();
  return now;
};
const getServerSnapshot = () => null;

export function useNow() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

const UNITS = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
] as const;

// 60 ticks across the bar, one per second of the current minute.
const TICKS = "repeating-linear-gradient(90deg, #000 0 calc(100% / 60 - 3px), transparent calc(100% / 60 - 3px) calc(100% / 60))";

export function Countdown({ target, end, className }: { target: string; end: string; className?: string }) {
  const t = useNow();
  const start = Date.parse(target);
  const finish = Date.parse(end);
  const values = t === null ? null : parts(start - t);
  const live = t !== null && t >= start && t < finish;
  const over = t !== null && t >= finish;

  if (live || over) {
    return (
      <div className={cn("tone-mint flex items-center gap-3 rounded-2xl bg-accent-soft px-5 py-4 text-accent-ink", className)} role="status">
        <span className="relative flex h-3 w-3">
          {live ? <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-[var(--accent)]" /> : null}
          <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--accent-ink)]" />
        </span>
        <span className="font-display text-lg font-semibold">{live ? "The workshop is happening now!" : "That's a wrap. Thank you for joining us!"}</span>
      </div>
    );
  }

  // Share of the current minute that has gone by: the tick bar fills up once a minute.
  const minute = values ? ((60 - values.seconds) / 60) * 100 : 0;
  return (
    <div className={cn("min-w-0", className)} role="timer" aria-live="off" aria-label="Time remaining until the workshop starts">
      <div className="flex items-start justify-between">
        {UNITS.map(({ key, label }, i) => {
          const v = values ? values[key] : null;
          const text = v === null ? "--" : String(v).padStart(2, "0");
          return (
            <Fragment key={key}>
              {i ? (
                <span aria-hidden className="px-0.5 font-display text-3xl leading-none font-light text-border-strong sm:text-[3.25rem] lg:text-[4rem]">
                  :
                </span>
              ) : null}
              <div className="min-w-[2.6ch] text-center">
                <span key={text} className={cn("mi-tick block font-display text-[2.4rem] leading-none font-bold tracking-tight tabular sm:text-[3.5rem] lg:text-[4.25rem]", i === 0 ? "text-gradient" : "text-fg")}>
                  {text}
                </span>
                <span className="mt-2 block text-[10px] font-bold tracking-[0.2em] text-subtle uppercase sm:text-[11px]">{label}</span>
              </div>
            </Fragment>
          );
        })}
      </div>
      <div aria-hidden className="mt-5 h-1.5" style={{ maskImage: TICKS, WebkitMaskImage: TICKS }}>
        <div className="relative h-full bg-border">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--azure),var(--lilac),var(--blush))] transition-[clip-path] duration-500" style={{ clipPath: `inset(0 ${100 - minute}% 0 0)` }} />
        </div>
      </div>
    </div>
  );
}
