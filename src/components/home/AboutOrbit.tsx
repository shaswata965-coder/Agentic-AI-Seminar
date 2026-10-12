"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { Aura } from "@/components/aura/Aura";
import { CmsIcon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { IconItem } from "@/lib/content/types";

const TONES = ["azure", "lilac", "mint", "peach", "butter", "blush"] as const;
// Aura's drawing is 260 × 300; her shoulders sit at (62, 170) and (198, 170) and her arms are 54 long.
const SHOULDER = { l: 62 / 260, r: 198 / 260, y: 170 / 300, arm: 54 / 260 };
const THINK_MS = 450;
const CYCLE_MS = 6500;

/** Angles (degrees, 0 = right, 90 = down) for n topics spread clockwise over `arc`, leaving the gap at the top. */
function angles(n: number, arc: number) {
  const start = -90 + (360 - arc) / 2;
  return Array.from({ length: n }, (_, i) => start + (n === 1 ? arc / 2 : (i * arc) / (n - 1)));
}
const rad = (deg: number) => (deg * Math.PI) / 180;

const REDUCED = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const useReducedMotion = () =>
  useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );

/**
 * Aura in the middle of a circle of About topics. Hovering, focusing or tapping a topic makes her
 * turn and point at it (a beam runs from her hand); then she answers: a speech bubble unfolds above
 * her head, shows a typing indicator and types the summary out. Idle and on screen, she walks
 * through the topics by herself. Circle size comes from --rx / --ry / --cy on the container.
 */
export function AboutOrbit({ points }: { points: IconItem[] }) {
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState(Infinity);
  const [thinking, setThinking] = useState(false);
  const [beam, setBeam] = useState<{ w: number; h: number; d: string; side: "l" | "r"; aim: number } | null>(null);
  const engaged = useRef(false);
  const shown = useRef(0);
  const box = useRef<HTMLDivElement>(null);
  const auraBox = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const n = points.length;
  const small = angles(n, 230);
  const large = angles(n, 260);
  const current = points[Math.min(active, n - 1)];
  const text = current?.description ?? "";

  // Pick a topic: Aura points at it, thinks for a moment, then types the summary.
  const select = (i: number) => {
    if (i === shown.current) return;
    shown.current = i;
    setActive(i);
    if (!reduced) {
      setThinking(true);
      setTyped(0);
    }
  };

  // Walk through the topics while the circle is on screen and nobody is pointing at or focused on it.
  useEffect(() => {
    if (!box.current || n < 2 || reduced) return;
    let onScreen = false;
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
    io.observe(box.current);
    const t = window.setInterval(() => {
      if (onScreen && !engaged.current && !document.hidden) select((shown.current + 1) % n);
    }, CYCLE_MS);
    return () => {
      io.disconnect();
      window.clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, reduced]);

  // Answering: a moment of "typing…", then the summary types itself out two letters at a time.
  useEffect(() => {
    if (!thinking) return;
    const t = window.setTimeout(() => setThinking(false), THINK_MS);
    return () => window.clearTimeout(t);
  }, [thinking, active]);
  useEffect(() => {
    if (thinking || typed >= text.length) return;
    const t = window.setTimeout(() => setTyped((c) => c + 2), 18);
    return () => window.clearTimeout(t);
  }, [thinking, typed, text.length]);

  // The pointing beam, from Aura's fingertip to the active topic (measured, so it follows every layout).
  useLayoutEffect(() => {
    const draw = () => {
      const root = box.current;
      const aura = auraBox.current;
      const icon = root?.querySelector<HTMLElement>(`[data-topic="${active}"] [data-icon]`);
      if (!root || !aura || !icon) return setBeam(null);
      const r = root.getBoundingClientRect();
      const a = aura.getBoundingClientRect();
      const t = icon.getBoundingClientRect();
      const tx = t.left + t.width / 2 - r.left;
      const ty = t.top + t.height / 2 - r.top;
      const right = tx >= a.left + a.width / 2 - r.left;
      const sx0 = a.left - r.left + a.width * (right ? SHOULDER.r : SHOULDER.l);
      const sy0 = a.top - r.top + a.height * SHOULDER.y;
      const len = Math.hypot(tx - sx0, ty - sy0) || 1;
      const ux = (tx - sx0) / len;
      const uy = (ty - sy0) / len;
      const sx = sx0 + ux * a.width * SHOULDER.arm;
      const sy = sy0 + uy * a.width * SHOULDER.arm;
      const ex = tx - ux * (t.width / 2 + 8);
      const ey = ty - uy * (t.width / 2 + 8);
      // Arm rotation: 0° hangs down, so rotation = direction − 90°; keep a little outward swing for targets straight below.
      let dir = (Math.atan2(uy, ux) * 180) / Math.PI;
      if (!right && dir < 0) dir += 360;
      const aim = right ? Math.min(dir - 90, -25) : Math.max(dir - 90, 25);
      setBeam({ w: r.width, h: r.height, d: `M${sx.toFixed(1)} ${sy.toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)}`, side: right ? "r" : "l", aim });
    };
    draw();
    const ro = new ResizeObserver(draw);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, [active]);

  if (!n || !current) return null;
  const tone = `tone-${TONES[active % TONES.length]}`;
  // Aim with the arm on the topic's side (measured with the beam; estimated until then).
  const deg = large[active];
  const side = beam?.side ?? (Math.cos(rad(deg)) >= 0 ? "r" : "l");
  const aim = beam?.aim ?? (side === "r" ? Math.min(deg - 90, -25) : Math.max(deg - 90, 25));
  const done = typed >= text.length;

  return (
    <div
      ref={box}
      className="about-orbit relative mx-auto mt-4 aspect-[10/12.6] w-full max-w-[26rem] [--cy:59%] [--rx:41%] [--ry:32.5%] sm:aspect-[16/13] sm:max-w-none sm:[--cy:48%] sm:[--rx:33%] sm:[--ry:40.5%] lg:aspect-[16/10] lg:[--cy:52%] lg:[--rx:25%] lg:[--ry:40%]"
      onPointerEnter={() => (engaged.current = true)}
      onPointerLeave={() => (engaged.current = false)}
      onFocus={() => (engaged.current = true)}
      onBlur={() => (engaged.current = false)}
    >
      {/* Orbit rings, a soft glow and two travelling sparks. */}
      <div aria-hidden className="absolute top-[calc(var(--cy)-var(--ry))] left-[calc(50%-var(--rx))] h-[calc(2*var(--ry))] w-[calc(2*var(--rx))] rounded-[50%] border-2 border-dashed border-border-strong opacity-70" />
      <div aria-hidden className="absolute top-[calc(var(--cy)-var(--ry)*0.55)] left-[calc(50%-var(--rx)*0.55)] h-[calc(1.1*var(--ry))] w-[calc(1.1*var(--rx))] rounded-[50%] border border-border" />
      <div aria-hidden className="absolute top-[var(--cy)] left-1/2 h-[50%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--mint)_45%,transparent),color-mix(in_oklab,var(--lilac)_25%,transparent)_60%,transparent)] blur-xl" />
      <span aria-hidden className="orbit-spark" />
      <span aria-hidden className="orbit-spark" />

      {/* The pointing beam. */}
      {beam ? (
        <svg aria-hidden className={cn(tone, "pointer-events-none absolute inset-0 h-full w-full overflow-visible")} viewBox={`0 0 ${beam.w} ${beam.h}`}>
          <path key={active} d={beam.d} className="orbit-beam" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 7" />
        </svg>
      ) : null}

      {/* Aura: leans and points toward the topic, then answers in a speech bubble above her head. */}
      <div
        ref={auraBox}
        className="about-aura absolute top-[var(--cy)] left-1/2 w-[30%] sm:w-[22%] lg:w-[260px]"
        data-aim={side}
        style={{ "--aim": `${aim}deg`, "--lean": `${(Math.cos(rad(deg)) * 5).toFixed(2)}deg` } as CSSProperties}
      >
        <div aria-hidden className={cn(tone, "absolute bottom-[88%] left-1/2 flex w-[15rem] -translate-x-1/2 flex-col items-center sm:w-[17rem] lg:w-[19rem]")}>
          <div key={active} className="answer-bubble relative w-full rounded-[1.6rem] border border-border bg-surface px-5 py-4 text-center shadow-card-lg">
            <p className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-[0.16em] text-accent-ink uppercase">
              <CmsIcon name={current.icon} size={14} />
              {current.title}
            </p>
            <div className="mt-1.5 grid font-display text-[15px] leading-snug font-medium text-fg sm:text-[16.5px]">
              {/* The full text reserves the bubble's size; the typed part sits on top of it. */}
              <span className="invisible [grid-area:1/1]">{text}</span>
              {thinking ? (
                <span className="typing-dots flex items-center justify-center gap-1.5 [grid-area:1/1]">
                  <i />
                  <i />
                  <i />
                </span>
              ) : (
                <span className="[grid-area:1/1]">
                  {text.slice(0, typed)}
                  {!done ? <span className="answer-caret" /> : null}
                </span>
              )}
            </div>
          </div>
          <span key={`a${active}`} className="rising-dot mt-2 h-4 w-4 rounded-full border border-border bg-surface shadow-card [animation-delay:180ms]" />
          <span key={`b${active}`} className="rising-dot mt-1 ml-5 h-2.5 w-2.5 rounded-full border border-border bg-surface shadow-card [animation-delay:90ms]" />
          <span key={`c${active}`} className="rising-dot mt-1 ml-9 h-1.5 w-1.5 rounded-full border border-border bg-surface" />
        </div>
        <Aura
          variant="thinker"
          size={260}
          look={{ x: Number((Math.cos(rad(deg)) * 0.85).toFixed(2)), y: Number((Math.sin(rad(deg)) * 0.6).toFixed(2)) }}
          overrides={{ effects: [], expression: thinking ? "focus" : done ? "happy" : "curious" }}
          className="max-w-full"
        />
      </div>

      <ul>
        {points.map((p, i) => {
          const on = i === active;
          const lg = large[i];
          const c = Math.cos(rad(lg));
          // On large screens the label sits beside the icon, facing out; near the bottom it goes underneath.
          const where = c > 0.3 ? "right" : c < -0.3 ? "left" : "below";
          return (
            <li
              key={`${p.title}-${i}`}
              data-topic={i}
              className={cn(`tone-${TONES[i % TONES.length]}`, "absolute h-0 w-0 top-[calc(var(--cy)+var(--s1)*var(--ry))] left-[calc(50%+var(--c1)*var(--rx))] lg:top-[calc(var(--cy)+var(--s2)*var(--ry))] lg:left-[calc(50%+var(--c2)*var(--rx))]")}
              style={{ "--c1": Math.cos(rad(small[i])).toFixed(4), "--s1": Math.sin(rad(small[i])).toFixed(4), "--c2": c.toFixed(4), "--s2": Math.sin(rad(lg)).toFixed(4) } as CSSProperties}
            >
              <button
                type="button"
                aria-pressed={on}
                onPointerEnter={() => select(i)}
                onFocus={() => select(i)}
                onClick={() => select(i)}
                className={cn(
                  "group absolute top-[-1.375rem] left-0 flex w-max -translate-x-1/2 flex-col items-center gap-1.5 rounded-2xl sm:top-[-1.75rem]",
                  where === "right" && "lg:top-0 lg:left-[-1.75rem] lg:translate-x-0 lg:-translate-y-1/2 lg:flex-row lg:gap-3",
                  where === "left" && "lg:top-0 lg:right-[-1.75rem] lg:left-auto lg:translate-x-0 lg:-translate-y-1/2 lg:flex-row-reverse lg:gap-3",
                )}
              >
                <span
                  data-icon
                  className={cn(
                    "grid h-11 w-11 shrink-0 place-items-center rounded-full shadow-card ring-2 transition-[scale,background-color,color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] sm:h-14 sm:w-14",
                    on ? "scale-110 bg-[var(--accent)] text-[#0f172a] ring-[color-mix(in_oklab,var(--accent)_45%,transparent)]" : "bg-surface text-accent-ink ring-[color-mix(in_oklab,var(--accent)_70%,transparent)] group-hover:scale-110",
                  )}
                >
                  <CmsIcon name={p.icon} size={21} />
                </span>
                <span className={cn("max-w-[10rem] font-display text-[15px] leading-tight font-semibold whitespace-nowrap transition-colors max-sm:sr-only sm:text-base", on ? "text-accent-ink" : "text-fg")}>{p.title}</span>
                <span className="sr-only">: {p.description}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
