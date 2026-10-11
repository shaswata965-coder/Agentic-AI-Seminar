"use client";

import { useSyncExternalStore } from "react";
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

const TILES = [
  { key: "days", label: "Days", tone: "tone-azure" },
  { key: "hours", label: "Hours", tone: "tone-lilac" },
  { key: "minutes", label: "Minutes", tone: "tone-mint" },
  { key: "seconds", label: "Seconds", tone: "tone-peach" },
] as const;

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
        <span className="font-display text-lg font-semibold">{live ? "The workshop is happening now!" : "That's a wrap — thank you for joining us!"}</span>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-4 gap-2 sm:gap-3", className)} role="timer" aria-live="off" aria-label="Time remaining until the workshop starts">
      {TILES.map(({ key, label, tone }) => {
        const v = values ? values[key] : null;
        const text = v === null ? "--" : String(v).padStart(2, "0");
        return (
          <div key={key} className={cn(tone, "relative overflow-hidden rounded-2xl bg-accent-soft px-2 py-3 text-center ring-1 ring-inset ring-[color-mix(in_oklab,var(--accent)_35%,transparent)] sm:py-4")}>
            <span key={text} className="mi-tick block font-display text-3xl font-bold text-fg tabular sm:text-[2.6rem] sm:leading-none">
              {text}
            </span>
            <span className="mt-1.5 block text-[11px] font-bold tracking-[0.14em] text-accent-ink uppercase sm:text-xs">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
