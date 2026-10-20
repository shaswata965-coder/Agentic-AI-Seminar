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
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export function Countdown({
  target,
  end,
  className,
  label = "WORKSHOP STARTS IN",
}: {
  target: string;
  end: string;
  className?: string;
  label?: string;
}) {
  const t = useNow();
  const start = Date.parse(target);
  const finish = Date.parse(end);
  const values = t === null ? null : parts(start - t);
  const live = t !== null && t >= start && t < finish;
  const over = t !== null && t >= finish;

  if (live || over) {
    return (
      <div
        className={cn(
          "tone-mint inline-flex items-center gap-2 rounded-2xl border border-border/80 bg-surface/90 px-3.5 py-2 text-xs text-accent-ink shadow-xs backdrop-blur-md",
          className,
        )}
        role="status"
      >
        <span className="relative flex h-2 w-2">
          {live ? <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-[var(--accent)]" /> : null}
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent-ink)]" />
        </span>
        <span className="font-display font-semibold">
          {live ? "Workshop happening now!" : "Workshop concluded"}
        </span>
      </div>
    );
  }

  const d = values ? String(values.days).padStart(2, "0") : "--";
  const h = values ? String(values.hours).padStart(2, "0") : "--";
  const m = values ? String(values.minutes).padStart(2, "0") : "--";
  const s = values ? String(values.seconds).padStart(2, "0") : "--";

  return (
    <div
      className={cn(
        "group relative flex flex-col items-start rounded-2xl border border-border/80 bg-surface/90 px-3.5 py-2 shadow-xs backdrop-blur-md transition-all duration-200 hover:border-brand/40 hover:shadow-card dark:border-border/60 dark:bg-surface/85",
        className,
      )}
      role="timer"
      aria-label={`${label}: ${d} days, ${h} hours, ${m} minutes, ${s} seconds`}
    >
      {/* Top row: ⏳ WORKSHOP STARTS IN */}
      <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] uppercase text-subtle">
        <span aria-hidden className="text-xs leading-none">⏳</span>
        <span className="text-muted dark:text-subtle">{label}</span>
      </div>

      {/* Numbers row: 55d : 14h : 49m : 20s */}
      <div className="mt-0.5 flex items-baseline gap-1 font-display text-fg">
        {/* Days */}
        <div className="flex items-baseline">
          <span className="text-sm font-extrabold tracking-tight tabular-nums text-brand dark:text-azure">
            {d}
          </span>
          <span className="ml-0.5 text-[10px] font-bold text-subtle">d</span>
        </div>

        <span aria-hidden className="px-0.5 text-xs font-light text-border-strong">:</span>

        {/* Hours */}
        <div className="flex items-baseline">
          <span className="text-sm font-extrabold tracking-tight tabular-nums text-lilac-ink dark:text-lilac">
            {h}
          </span>
          <span className="ml-0.5 text-[10px] font-bold text-subtle">h</span>
        </div>

        <span aria-hidden className="px-0.5 text-xs font-light text-border-strong">:</span>

        {/* Minutes */}
        <div className="flex items-baseline">
          <span className="text-sm font-extrabold tracking-tight tabular-nums text-brand dark:text-azure">
            {m}
          </span>
          <span className="ml-0.5 text-[10px] font-bold text-subtle">m</span>
        </div>

        <span aria-hidden className="px-0.5 text-xs font-light text-border-strong">:</span>

        {/* Seconds */}
        <div className="flex items-baseline">
          <span className="text-sm font-extrabold tracking-tight tabular-nums text-lilac-ink dark:text-lilac">
            {s}
          </span>
          <span className="ml-0.5 text-[10px] font-bold text-subtle">s</span>
        </div>
      </div>
    </div>
  );
}
