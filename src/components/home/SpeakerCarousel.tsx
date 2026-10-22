"use client";

import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode, type WheelEvent } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/content/constants";

export interface SpeakerSlide {
  id: string;
  href: string;
  name: string;
  photo: string;
  designation: string;
  affiliation: string;
  keynote: boolean;
  label: string;
  labelTone: Tone;
  tone: Tone;
  theme?: { label: string; tone: Tone };
  talkTitle: string;
}

type Slide = { kind: "speaker"; id: string; sp: SpeakerSlide } | { kind: "more"; id: string };

/** Where slide i sits from the front one: 0 in front, then ±1, ±2… round the loop, the far side shared out evenly. */
function place(i: number, active: number, n: number) {
  const back = Math.floor((n - 1) / 2);
  return ((((i - active) % n) + n + back) % n) - back;
}

const NAV =
  "grid shrink-0 place-items-center rounded-full border border-border bg-surface/80 text-fg shadow-card backdrop-blur transition-[translate,background-color,color] duration-200 hover:-translate-y-0.5 hover:bg-accent-soft hover:text-accent-ink";

// The ::after overlay covers the card; the focus ring is drawn on it so it outlines the whole card.
const STRETCH =
  "after:absolute after:inset-0 after:z-[1] after:rounded-[1.75rem] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-[-2px] focus-visible:after:outline-[var(--ring)] focus-visible:after:outline-solid";

function SpeakerCard({ sp, front, link }: { sp: SpeakerSlide; front: boolean; link: string }) {
  return (
    <div className={cn(`tone-${sp.tone}`, "sp-card relative isolate flex h-full overflow-hidden rounded-[1.75rem] p-[2px] shadow-card-lg")}>
      {/* The edge: a conic gradient spinning behind the front card, seen only in the 2px around it. */}
      <span aria-hidden className="sp-card-ring absolute top-1/2 left-1/2 aspect-square w-[260%] -translate-1/2 bg-[conic-gradient(from_0deg,var(--accent),transparent_22%,var(--accent-ink)_45%,transparent_70%,var(--accent))]" />
      <div className="relative flex w-full flex-col overflow-hidden rounded-[calc(1.75rem-2px)] bg-surface">
        <div className="relative h-28 shrink-0 bg-[linear-gradient(150deg,color-mix(in_oklab,var(--accent)_60%,transparent),color-mix(in_oklab,var(--accent)_14%,transparent))]">
          <span aria-hidden className="bg-dots absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
          <span aria-hidden className="absolute -top-10 -right-8 h-36 w-36 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--surface)_70%,transparent),transparent)]" />
          <div className="relative flex items-start justify-between gap-2 p-3.5">
            <Badge tone={sp.labelTone} size="xs" className="shadow-card">
              {sp.keynote ? <Star size={11} aria-hidden fill="currentColor" /> : null}
              {sp.label}
            </Badge>
            {sp.theme ? (
              <Badge tone={sp.theme.tone} size="xs" className="shadow-card">
                {sp.theme.label}
              </Badge>
            ) : null}
          </div>
        </div>
        <div className="relative -mt-14 flex justify-center">
          <span aria-hidden className="sp-card-halo absolute top-1/2 left-1/2 h-[7.75rem] w-[7.75rem] -translate-1/2 rounded-full bg-[conic-gradient(from_120deg,var(--accent),var(--lilac),var(--mint),var(--accent))] opacity-70 blur-[2px]" />
          <Avatar name={sp.name} src={sp.photo} size={112} className="relative ring-4 ring-surface" />
        </div>
        <div className="flex flex-1 flex-col items-center px-5 pt-4 pb-5 text-center">
          <h3 className="font-display text-xl leading-snug font-bold text-fg">
            {/* On a side card the click is left to the slide, which brings it to the front. */}
            <Link href={sp.href} draggable={false} tabIndex={front ? undefined : -1} onClick={front ? undefined : (e) => e.preventDefault()} className={STRETCH} data-stretch="">
              {sp.name}
              <span className="sr-only">, {link}</span>
            </Link>
          </h3>
          {sp.designation ? <p className="mt-1 line-clamp-2 text-sm text-muted">{sp.designation}</p> : null}
          {sp.affiliation ? <p className="mt-0.5 line-clamp-1 text-sm font-medium text-subtle">{sp.affiliation}</p> : null}
          {sp.talkTitle ? (
            <p className="mt-4 line-clamp-3 w-full rounded-2xl bg-accent-soft/70 px-4 py-3 text-sm font-medium text-accent-ink ring-1 ring-[color-mix(in_oklab,var(--accent)_35%,transparent)] ring-inset">“{sp.talkTitle}”</p>
          ) : null}
          <span aria-hidden className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-accent-ink">
            {link}
            <ArrowRight size={15} className="transition-transform duration-300 group-hover/slide:translate-x-1" />
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * The home page's speakers as a looping cover flow: the front card faces you with its edge spinning, the
 * others turn away round it, dimmed. Arrows, the dots, a swipe or drag, a sideways trackpad scroll and the
 * arrow keys turn it; pointing at a side card and clicking brings it to the front, and clicking the front
 * card opens that speaker's profile. It turns by itself while a bar fills in the dot of the front card (CSS,
 * so it holds while the pointer or focus is on the carousel, while it is off screen, after Pause, and never
 * runs with reduced motion). A slide that would have to cross behind the others to keep its place in the
 * loop fades back in at its new place instead.
 */
export function SpeakerCarousel({ speakers, more, label, link }: { speakers: SpeakerSlide[]; more?: ReactNode; label: string; link: string }) {
  const slides: Slide[] = [...speakers.map((sp): Slide => ({ kind: "speaker", id: sp.id, sp })), ...(more ? [{ kind: "more" as const, id: "more" }] : [])];
  const n = slides.length;
  const [state, setState] = useState({ active: 0, laps: [] as number[] });
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(false);
  const [said, setSaid] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; dx: number; on: boolean } | null>(null);
  const dragged = useRef(false);
  const wheel = useRef({ sum: 0, until: 0 });
  const active = n ? Math.min(state.active, n - 1) : 0;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function go(to: number, announce = false) {
    const next = ((to % n) + n) % n;
    setState((st) => {
      const from = Math.min(st.active, n - 1);
      if (next === from) return st;
      // Every slide moves the same way round as the front one; a slide that can't (it wraps round the back) is remounted.
      const d = place(next, from, n);
      const laps = Array.from({ length: n }, (_, i) => (st.laps[i] ?? 0) + (place(i, next, n) === place(i, from, n) - d ? 0 : 1));
      return { active: next, laps };
    });
    if (announce) {
      const s = slides[next];
      setSaid(`${next + 1} of ${n}${s.kind === "speaker" ? `: ${s.sp.name}` : ""}`);
    }
  }

  /** The distance between the front card and the next one, for turning a drag into steps. */
  function stepPx() {
    const stage = stageRef.current;
    const a = stage?.querySelector('[data-off="0"]')?.getBoundingClientRect();
    const b = stage?.querySelector('[data-off="1"]')?.getBoundingClientRect();
    return a && b ? Math.max(80, b.left + b.width / 2 - (a.left + a.width / 2)) : 220;
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (n < 2 || (e.pointerType === "mouse" && e.button !== 0)) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, on: false };
    dragged.current = false;
  }
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    const stage = stageRef.current;
    if (!d || !stage || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!d.on) {
      if (Math.abs(dx) < 8) return;
      // Mostly up or down: leave it to the page.
      if (Math.abs(e.clientY - d.y) > Math.abs(dx)) {
        drag.current = null;
        return;
      }
      d.on = true;
      stage.setPointerCapture(e.pointerId);
      stage.dataset.dragging = "";
    }
    d.dx = dx;
    stage.style.setProperty("--drag", `${dx}px`);
  }
  function onPointerEnd(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    const stage = stageRef.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.on || !stage) return;
    dragged.current = true;
    delete stage.dataset.dragging;
    stage.style.removeProperty("--drag");
    const steps = Math.round(-d.dx / stepPx()) || (Math.abs(d.dx) > 40 ? -Math.sign(d.dx) : 0);
    if (steps) go(active + steps, true);
  }
  // A drag ends in a click on whatever is under the pointer: swallow it.
  function onClickCapture(e: MouseEvent) {
    if (!dragged.current) return;
    dragged.current = false;
    e.preventDefault();
    e.stopPropagation();
  }
  function onWheel(e: WheelEvent) {
    if (n < 2 || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    const w = wheel.current;
    if (e.timeStamp < w.until) return;
    w.sum += e.deltaX;
    if (Math.abs(w.sum) < 60) return;
    go(active + Math.sign(w.sum), true);
    w.sum = 0;
    w.until = e.timeStamp + 500;
  }
  function onKeyDown(e: KeyboardEvent) {
    const to = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: n - 1 }[e.key];
    if (to === undefined || n < 2) return;
    e.preventDefault();
    go(to, true);
  }

  if (!n) return null;
  const controls = n > 1;
  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      data-hold={inView ? undefined : ""}
      onKeyDown={onKeyDown}
      className="sp-carousel group/carousel"
    >
      <div
        ref={stageRef}
        id="speaker-carousel-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClickCapture={onClickCapture}
        onWheel={onWheel}
        className="sp-stage -mx-4 grid touch-pan-y py-6 select-none [mask-image:linear-gradient(90deg,transparent,black_9%,black_91%,transparent)] [overflow-x:clip] sm:-mx-6 lg:-mx-8"
      >
        {slides.map((s, i) => {
          const off = place(i, active, n);
          const abs = Math.abs(off);
          const front = off === 0;
          return (
            <div
              key={`${s.id}-${state.laps[i] ?? 0}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}`}
              aria-hidden={front ? undefined : true}
              data-off={off}
              data-abs={Math.min(abs, 3)}
              data-front={front ? "" : undefined}
              style={{ "--off": off, "--abs": abs } as CSSProperties}
              onClick={front ? undefined : () => go(i, true)}
              className={cn("sp-slide group/slide relative col-start-1 row-start-1 justify-self-center", !front && "cursor-pointer")}
            >
              {s.kind === "speaker" ? <SpeakerCard sp={s.sp} front={front} link={link} /> : more}
            </div>
          );
        })}
      </div>

      {controls ? (
        <div className="mt-6 flex items-center justify-center gap-2 sm:gap-3">
          <button type="button" onClick={() => go(active - 1, true)} aria-controls="speaker-carousel-stage" aria-label="Previous speaker" data-ripple="" className={cn(NAV, "h-11 w-11")}>
            <ChevronLeft size={20} aria-hidden />
          </button>
          <div role="group" aria-label="Choose a speaker" className="flex max-w-[70vw] flex-wrap items-center justify-center rounded-full border border-border bg-surface/80 px-2 py-1 shadow-card backdrop-blur">
            {slides.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i, true)}
                  aria-controls="speaker-carousel-stage"
                  aria-current={on ? "true" : undefined}
                  aria-label={s.kind === "speaker" ? s.sp.name : `${i + 1} of ${n}`}
                  className="group/dot grid h-7 place-items-center px-1"
                >
                  <span
                    className={cn(
                      "relative block h-2 overflow-hidden rounded-full transition-[width,background-color] duration-300",
                      on ? "w-8 bg-accent-soft ring-1 ring-[color-mix(in_oklab,var(--accent)_50%,transparent)] ring-inset" : "w-2 bg-border-strong group-hover/dot:bg-[var(--accent)]",
                    )}
                  >
                    {on ? (
                      playing ? (
                        <span key={active} aria-hidden onAnimationEnd={() => go(active + 1)} className="sp-timer absolute inset-0 rounded-full bg-[var(--accent-ink)]" />
                      ) : (
                        <span aria-hidden className="absolute inset-0 rounded-full bg-[var(--accent-ink)]" />
                      )
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => go(active + 1, true)} aria-controls="speaker-carousel-stage" aria-label="Next speaker" data-ripple="" className={cn(NAV, "h-11 w-11")}>
            <ChevronRight size={20} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause the carousel" : "Play the carousel"}
            className={cn(NAV, "h-9 w-9 motion-reduce:hidden")}
          >
            {playing ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />}
          </button>
        </div>
      ) : null}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {said}
      </p>
    </div>
  );
}
