"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Aura } from "@/components/aura/Aura";
import { CmsIcon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { IconItem } from "@/lib/content/types";

const TONES = ["azure", "lilac", "mint", "peach", "butter", "blush"] as const;

/** Spread n points clockwise over `arc` degrees, leaving the gap centred at the top (−90°). */
function angles(n: number, arc: number) {
  const start = -90 + (360 - arc) / 2;
  return Array.from({ length: n }, (_, i) => ((start + (n === 1 ? arc / 2 : (i * arc) / (n - 1))) * Math.PI) / 180);
}

/**
 * Aura in the middle of an orbit of short points. Hovering, focusing or tapping a point makes its
 * answer float up out of Aura's head; when nobody is interacting she cycles through them.
 * The orbit's size comes from --rx / --ry / --cy on the container (see About.tsx).
 */
export function AboutOrbit({ points }: { points: IconItem[] }) {
  const [active, setActive] = useState(0);
  const engaged = useRef(false);
  const box = useRef<HTMLDivElement>(null);

  // Cycle through the points while the orbit is on screen and nobody is pointing at or focused on it.
  useEffect(() => {
    if (!box.current || points.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let onScreen = false;
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
    io.observe(box.current);
    const t = window.setInterval(() => {
      if (onScreen && !engaged.current && !document.hidden) setActive((a) => (a + 1) % points.length);
    }, 4500);
    return () => {
      io.disconnect();
      window.clearInterval(t);
    };
  }, [points.length]);

  if (!points.length) return null;
  const small = angles(points.length, 220);
  const large = angles(points.length, 280);
  const current = points[Math.min(active, points.length - 1)];
  const tone = `tone-${TONES[active % TONES.length]}`;

  return (
    <div
      ref={box}
      className="about-orbit relative mx-auto mt-4 aspect-[10/13] w-full max-w-[26rem] [--cy:58%] [--rx:42%] [--ry:31%] sm:aspect-[16/12] sm:max-w-none sm:[--cy:56%] sm:[--rx:40%] sm:[--ry:37%] lg:aspect-[16/10] lg:[--cy:52%] lg:[--rx:40%] lg:[--ry:37%]"
      onPointerEnter={() => (engaged.current = true)}
      onPointerLeave={() => (engaged.current = false)}
      onFocus={() => (engaged.current = true)}
      onBlur={() => (engaged.current = false)}
    >
      {/* Orbit rings, a soft glow and two travelling sparks. */}
      <div aria-hidden className="absolute top-[calc(var(--cy)-var(--ry))] left-[calc(50%-var(--rx))] h-[calc(2*var(--ry))] w-[calc(2*var(--rx))] rounded-[50%] border-2 border-dashed border-border-strong opacity-70" />
      <div aria-hidden className="absolute top-[calc(var(--cy)-var(--ry)*0.5)] left-[calc(50%-var(--rx)*0.5)] h-[var(--ry)] w-[var(--rx)] rounded-[50%] border border-border" />
      <div aria-hidden className="absolute top-[var(--cy)] left-1/2 h-[50%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--mint)_45%,transparent),color-mix(in_oklab,var(--lilac)_25%,transparent)_60%,transparent)] blur-xl" />
      <span aria-hidden className="orbit-spark" />
      <span aria-hidden className="orbit-spark" />

      {/* Aura, with the answer rising from her head as a thought bubble. */}
      <div className="absolute top-[var(--cy)] left-1/2 w-[30%] -translate-x-1/2 -translate-y-1/2 sm:w-[25%] lg:w-[300px]">
        <div aria-hidden className={cn(tone, "absolute bottom-[88%] left-1/2 flex w-[15rem] -translate-x-1/2 flex-col items-center sm:w-[18rem] lg:w-[20rem]")}>
          <div key={active} className="thought-bubble w-full rounded-[1.75rem] border border-border bg-surface px-5 py-4 text-center shadow-card-lg">
            <p className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-[0.16em] text-accent-ink uppercase">
              <CmsIcon name={current.icon} size={14} />
              {current.title}
            </p>
            <p className="mt-1.5 font-display text-[15px] leading-snug font-medium text-fg sm:text-[17px]">{current.description}</p>
          </div>
          <span key={`a${active}`} className="thought-dot mt-2 h-4 w-4 rounded-full border border-border bg-surface shadow-card [animation-delay:120ms]" />
          <span key={`b${active}`} className="thought-dot mt-1 ml-5 h-2.5 w-2.5 rounded-full border border-border bg-surface shadow-card [animation-delay:60ms]" />
          <span key={`c${active}`} className="thought-dot mt-1 ml-9 h-1.5 w-1.5 rounded-full border border-border bg-surface" />
        </div>
        <Aura variant="thinker" size={300} track overrides={{ effects: [] }} className="max-w-full" />
      </div>

      <ul>
        {points.map((p, i) => {
          const on = i === active;
          return (
            <li
              key={`${p.title}-${i}`}
              className={cn(
                `tone-${TONES[i % TONES.length]}`,
                "absolute top-[calc(var(--cy)+var(--s1)*var(--ry))] left-[calc(50%+var(--c1)*var(--rx))] -translate-x-1/2 -translate-y-[1.375rem] sm:-translate-y-7 lg:top-[calc(var(--cy)+var(--s2)*var(--ry))] lg:left-[calc(50%+var(--c2)*var(--rx))]",
              )}
              style={{ "--c1": Math.cos(small[i]).toFixed(4), "--s1": Math.sin(small[i]).toFixed(4), "--c2": Math.cos(large[i]).toFixed(4), "--s2": Math.sin(large[i]).toFixed(4) } as CSSProperties}
            >
              <button
                type="button"
                aria-pressed={on}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className="group flex w-[9rem] flex-col items-center gap-1.5 rounded-2xl text-center max-sm:w-11"
              >
                <span
                  className={cn(
                    "grid h-11 w-11 place-items-center rounded-full shadow-card ring-2 transition-[scale,background-color,color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] sm:h-14 sm:w-14",
                    on ? "scale-110 bg-[var(--accent)] text-[#0f172a] ring-[color-mix(in_oklab,var(--accent)_45%,transparent)]" : "bg-surface text-accent-ink ring-[color-mix(in_oklab,var(--accent)_70%,transparent)] group-hover:scale-110",
                  )}
                >
                  <CmsIcon name={p.icon} size={21} />
                </span>
                <span className={cn("max-sm:sr-only font-display text-[15px] leading-tight font-semibold transition-colors", on ? "text-accent-ink" : "text-fg")}>{p.title}</span>
                <span className="sr-only">: {p.description}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
