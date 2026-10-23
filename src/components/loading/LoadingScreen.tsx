"use client";

import "./loading.css";
import { useRouter } from "next/navigation";
import { memo, useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode, type RefObject } from "react";
import type { PageCopy } from "@/lib/schema/page-copy";
import { ASSETS_KEY } from "./flag";
import { showProgress, warmAssets, warmup } from "./warm";

/*
 * The home page's loading screen. While the site's files are fetched and cached (warm.ts), Aura's
 * ship (shaped like her: her floating head is the cockpit) tries to take off from a pad seen through a
 * round window, while small Auras in hard hats work on it: one tightens bolts from the gantry, one
 * polishes the cockpit, one welds, one flies in parts and one ticks off the checklist. The ring around
 * the window fills with the real progress. Once everything is cached she lifts off, the smoke fills
 * the screen, and as it clears the page is there, with the hero's Aura flying down into place.
 *
 * Every moving part is its own element, moved only with transform and opacity (loading.css), so the
 * browser's compositor runs the animation off the main thread: it stays smooth while the page loads.
 * flag.ts decides before the first paint whether it shows ("run"), caches without showing ("quiet")
 * or does nothing (this browser has the files already).
 */

type Phase = "work" | "lift" | "clear" | "gone";

/* Timings in ms; loading.css is written to match. */
const MAX_WAIT = 10000; // lift off by now (from when the page started loading), even if caching goes on behind
const RING = 450; // the ring's last stretch (its transition in loading.css)
const LIFT = 2600; // lift-off, until the smoke covers the screen
const CLEAR = 1600; // the smoke clearing

/** Smoke puffs: where each one ends up from the pad, how much it grows and when it starts (ms into lift-off). */
const BILLOWS: [x: string, y: string, s: number, d: number][] = [
  ["0vw", "-3vh", 1.6, 150],
  ["-26vw", "-1vh", 1.5, 250],
  ["26vw", "-1vh", 1.5, 250],
  ["-52vw", "-5vh", 2.1, 450],
  ["52vw", "-5vh", 2.1, 450],
  ["-5vw", "-24vh", 1.7, 650],
  ["6vw", "-44vh", 1.9, 850],
  ["-7vw", "-64vh", 2.1, 1000],
  ["5vw", "-86vh", 2.3, 1150],
  ["-40vw", "-38vh", 2.5, 1100],
  ["40vw", "-34vh", 2.5, 1200],
  ["-44vw", "-80vh", 2.7, 1350],
  ["44vw", "-76vh", 2.7, 1400],
  ["0vw", "-56vh", 3.1, 1500],
];

/* The <html data-launch> flag (flag.ts) is the source of truth: "run" while the screen shows, then "lifted". */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-launch"] });
  return () => observer.disconnect();
}
const readFlag = () => document.documentElement.dataset.launch ?? "";

/** Lift-off starts from wherever the ship is in its try: it crouches from there (on the compositor), then climbs. */
function crouch(ship: HTMLElement | null) {
  if (!ship?.animate) return;
  const from = getComputedStyle(ship).transform;
  ship.animate([{ transform: from === "none" ? "none" : from }, { transform: "scale(1.05, 0.93)", offset: 0.6 }, { transform: "scale(0.97, 1.04)" }], {
    duration: 450,
    easing: "cubic-bezier(0.3, 0, 0.3, 1)",
    fill: "forwards",
  });
}

const count = (text: string, done: number, total: number) => text.replace(/\{done\}/g, String(done)).replace(/\{total\}/g, String(total));

export function LoadingScreen({ eventName, routes, files, text }: { eventName: string; routes: string[]; files: string[]; text: PageCopy["homeLoader"] }) {
  const flag = useSyncExternalStore(subscribe, readFlag, () => "run");
  const progress = useSyncExternalStore(warmup.subscribe, warmup.get, warmup.initial);
  const [phase, setPhase] = useState<Phase>("work");
  const ship = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const uid = `lx${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // Load the main pages and cache the site's files, behind the screen or quietly. Once all is in, this
  // browser skips the screen until the site is updated.
  useEffect(() => {
    const html = document.documentElement;
    const mode = html.dataset.launch;
    if (mode !== "run" && mode !== "quiet") return;
    const version = html.dataset.assets ?? "";
    warmAssets(routes, files, (route) => router.prefetch(route)).then(() => {
      try {
        localStorage.setItem(ASSETS_KEY, version);
      } catch {}
      if (html.dataset.launch === "quiet") html.dataset.launch = "done";
    });
  }, [router, routes, files]);

  // Lift off as soon as everything is in (or at MAX_WAIT, while caching carries on).
  const cached = progress.stage === "done";
  useEffect(() => {
    if (flag !== "run" || phase !== "work") return;
    const t = window.setTimeout(
      () => {
        crouch(ship.current);
        setPhase("lift");
      },
      cached ? RING : Math.max(0, MAX_WAIT - performance.now()),
    );
    return () => window.clearTimeout(t);
  }, [flag, phase, cached]);

  // Lift-off, then the smoke clears; the page behind is let go (shown, scrolling, the hero Aura's fly-in) as it does.
  useEffect(() => {
    if (phase !== "lift" && phase !== "clear") return;
    showProgress(1);
    if (phase === "clear") document.documentElement.dataset.launch = "lifted";
    const t = window.setTimeout(() => setPhase(phase === "lift" ? "clear" : "gone"), phase === "lift" ? LIFT : CLEAR);
    return () => window.clearTimeout(t);
  }, [phase]);

  const shown = phase !== "gone" && (flag === "run" || (flag === "lifted" && phase === "clear"));
  if (!shown) return null;

  const stage = phase === "work" ? progress.stage : "done";
  const line =
    stage === "done" ? text.ready : stage === "page" ? text.page : count(stage === "pages" ? text.pages : text.files, progress.done, progress.total);

  return (
    <div className="launch fit-reset" data-phase={phase} data-edit="home.loader">
      <div className="launch-sky" aria-hidden />
      <div className="launch-stage">
        <div className="launch-scene" aria-hidden>
          <Scene uid={uid} shipRef={ship} />
          <Ring />
          <div className="launch-billows">
            {BILLOWS.map(([x, y, s, d], i) => (
              <span key={i} className="launch-puff" style={{ "--x": x, "--y": y, "--s": s, "--d": `${d}ms`, "--d2": `${(i % 4) * 70}ms` } as CSSProperties}>
                <span />
              </span>
            ))}
          </div>
        </div>
        <div className="launch-status" aria-hidden>
          <p className="launch-kicker">{eventName}</p>
          <p className="launch-percent" />
          <p className="launch-line">
            <span key={stage}>{line}</span>
          </p>
        </div>
      </div>
      <div className="launch-fog" aria-hidden />
      <p role="status" className="sr-only">
        {text.status}
      </p>
    </div>
  );
}

/* --------------------------------------------------------------- Ring -- */

/**
 * The progress ring: two half-rings turned into view (the classic two-halves technique), so it moves by
 * rotation alone. loading.css turns them from its --lx-p (0 to 1), which the head script (flag.ts) sets
 * while the page loads and warm.ts after that, so it moves from the first paint.
 */
function Ring() {
  return (
    <div className="lx-ring">
      <span className="lx-ring-track" />
      <span className="lx-ring-half lx-ring-right">
        <span className="lx-ring-arc" />
      </span>
      <span className="lx-ring-half lx-ring-left">
        <span className="lx-ring-arc" />
      </span>
      <span className="lx-ring-cap" />
      <span className="lx-ring-tip">
        <i />
      </span>
    </div>
  );
}

/* -------------------------------------------------------------- Scene -- */

const EYE = "#5fe3ff";
const STEEL = "#5b6b86";
const STEEL_DARK = "#3b4763";
const HAZARD = "#ffc95c";

/** Place an element on the scene: left, top and width as a percentage of the scene's side. */
const at = (left: number, top: number, width: number, extra?: CSSProperties) => ({ left: `${left}%`, top: `${top}%`, width: `${width}%`, ...extra }) as CSSProperties;
const flee = (x: string, y: string, delay: number) => ({ "--fx": x, "--fy": y, "--fd": `${delay}s` }) as CSSProperties;

/** The drawing. It changes only at lift-off, so the ring and the status can update without redrawing it. */
const Scene = memo(function Scene({ uid, shipRef }: { uid: string; shipRef: RefObject<HTMLDivElement | null> }) {
  return (
    <>
      <Paints uid={uid} />
      <Window />
      <Ship uid={uid} shipRef={shipRef} />
      {/* Dust kicked up on every try */}
      {[41, 46.5, 52].map((left, i) => (
        <span key={left} className="lx-dust" style={at(left, 72.5, 7, { animationDelay: `${i * 0.06}s`, "--dx": ["-55%", "0%", "55%"][i] } as CSSProperties)} />
      ))}
      <Crew uid={uid} />
    </>
  );
});

/** Gradients shared by the drawings (ids are page-wide). */
function Paints({ uid }: { uid: string }) {
  return (
    <svg width="0" height="0" className="absolute" focusable="false">
      <defs>
        <radialGradient id={`${uid}-shell`} cx="38%" cy="28%" r="80%">
          <stop offset="0%" stopColor="var(--aura-body-1, #fff)" />
          <stop offset="60%" stopColor="var(--aura-body-2, #f1f5fb)" />
          <stop offset="100%" stopColor="var(--aura-body-3, #d3ddec)" />
        </radialGradient>
        <linearGradient id={`${uid}-hull`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--aura-body-3, #d3ddec)" />
          <stop offset="34%" stopColor="var(--aura-body-1, #fff)" />
          <stop offset="70%" stopColor="var(--aura-body-2, #f1f5fb)" />
          <stop offset="100%" stopColor="var(--aura-body-3, #d3ddec)" />
        </linearGradient>
        <linearGradient id={`${uid}-visor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--aura-visor-1, #1d2946)" />
          <stop offset="100%" stopColor="var(--aura-visor-2, #060a14)" />
        </linearGradient>
        <linearGradient id={`${uid}-fin`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cbbcff" />
          <stop offset="100%" stopColor="#9a83f2" />
        </linearGradient>
        <radialGradient id={`${uid}-core`}>
          <stop offset="0%" stopColor={EYE} stopOpacity="0.9" />
          <stop offset="100%" stopColor={EYE} stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/** The round window: a dawn sky, hills, the gantry and the launch pad. */
function Window() {
  const braces = Array.from({ length: 6 }, (_, i) => `M33 ${68 + i * 16} L41 ${76 + i * 16} L33 ${84 + i * 16}`).join(" ");
  return (
    <div className="lx-window">
      <span className="lx-moon" />
      {[
        [24, 30],
        [70, 18],
        [82, 34],
        [58, 10],
        [36, 14],
      ].map(([left, top], i) => (
        <span key={i} className="lx-star" style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${-i * 0.9}s` }} />
      ))}
      <svg viewBox="0 0 200 200" className="lx-land" focusable="false">
        <path className="lx-hill-far" d="M0 146 C28 128 54 132 80 142 C106 152 128 124 158 130 C178 134 192 142 200 146 V200 H0 Z" />
        <path className="lx-hill-near" d="M0 158 C26 148 48 150 70 156 C96 163 122 148 150 152 C172 155 188 160 200 162 V200 H0 Z" />
        <rect className="lx-ground" x="0" y="162" width="200" height="40" />
        {/* Gantry */}
        <g fill={STEEL}>
          <rect x="30" y="58" width="3" height="106" rx="1" />
          <rect x="41" y="58" width="3" height="106" rx="1" />
        </g>
        <path d={braces} fill="none" stroke="#a3b1c6" strokeWidth="1.2" strokeLinejoin="round" />
        <rect x="27" y="54" width="20" height="4.5" rx="1.5" fill={STEEL_DARK} />
        <rect x="36" y="48" width="2.4" height="6" fill={STEEL_DARK} />
        {/* Launch pad */}
        <rect x="64" y="157" width="72" height="5" rx="1.5" fill={STEEL} />
        <rect x="58" y="162" width="84" height="9" rx="2" fill="#1f2638" />
        <g fill={HAZARD}>
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M${62 + i * 9} 169 l5 -5 h4 l-5 5 Z`} />
          ))}
        </g>
      </svg>
      <span className="lx-beacon" />
      {/* The gantry's arm, swung away at lift-off */}
      <span className="lx-arm" />
    </div>
  );
}

/**
 * Aura's ship, shaped like her: her floating head is the cockpit, her fin-like arms are the side
 * boosters, and her eyes (drawn on top, so they can blink and change) look out of the visor.
 */
function Ship({ uid, shipRef }: { uid: string; shipRef: RefObject<HTMLDivElement | null> }) {
  const u = (name: string) => `url(#${uid}-${name})`;
  return (
    <div className="lx-ship" style={at(37, 32.2, 26)}>
      <div ref={shipRef} className="lx-ship-try">
        <span className="lx-trail" />
        <span className="lx-glow" />
        <span className="lx-flame">
          <i />
        </span>
        <svg viewBox="0 0 100 170" className="lx-ship-art" focusable="false">
          {/* Landing fins */}
          <path d="M26 128 C14 138 9 152 9 166 L30 157 Z" fill={u("fin")} />
          <path d="M74 128 C86 138 91 152 91 166 L70 157 Z" fill={u("fin")} />
          {/* Side boosters: her arms */}
          <ellipse cx="13" cy="106" rx="6.5" ry="17" transform="rotate(14 13 106)" fill={u("shell")} stroke="var(--aura-edge, #c9d4e5)" strokeWidth="0.8" />
          <ellipse cx="87" cy="106" rx="6.5" ry="17" transform="rotate(-14 87 106)" fill={u("shell")} stroke="var(--aura-edge, #c9d4e5)" strokeWidth="0.8" />
          {/* Nozzle */}
          <path d="M39 154 L61 154 L65 166 L35 166 Z" fill={STEEL_DARK} />
          <rect x="33" y="164" width="34" height="4" rx="2" fill={STEEL} />
          {/* Body */}
          <path d="M50 67 C72 67 84 83 84 105 C84 129 72 150 62 157 L38 157 C28 150 16 129 16 105 C16 83 28 67 50 67 Z" fill={u("hull")} stroke="var(--aura-edge, #c9d4e5)" strokeWidth="0.8" />
          <path d="M27 86 C31 77 38 72 46 71" fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="106" r="12" fill={u("core")} />
          <circle cx="50" cy="106" r="7" fill={u("visor")} />
          <path d="M50 100 Q51 105 56 106 Q51 107 50 112 Q49 107 44 106 Q49 105 50 100 Z" fill={EYE} />
          <path d="M28 138 C38 146 62 146 72 138" fill="none" stroke={EYE} strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
          {/* The glow her head floats on */}
          <ellipse cx="50" cy="63.5" rx="19" ry="2.2" fill={EYE} opacity="0.55" />
          {/* Head: the cockpit */}
          <path d="M50 8 C70 8 82 20 82 36 C82 52 68 60 50 60 C32 60 18 52 18 36 C18 20 30 8 50 8 Z" fill={u("shell")} stroke="var(--aura-edge, #c9d4e5)" strokeWidth="0.8" />
          <path d="M28 20 C33 14 40 11 47 10.5" fill="none" stroke="#fff" strokeOpacity="0.95" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M50 18 C64 18 73 26 73 37 C73 47 63 52 50 52 C37 52 27 47 27 37 C27 26 36 18 50 18 Z" fill={u("visor")} />
          <path d="M34 26 C38 22.5 43 21 49 21" fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="1.6" strokeLinecap="round" />
          {/* Headset */}
          <path d="M19.5 37 C17 8 83 8 80.5 37" fill="none" stroke={STEEL_DARK} strokeWidth="3" strokeLinecap="round" />
          <rect x="14" y="30" width="7" height="13" rx="3.5" fill="#2b3550" stroke={EYE} strokeWidth="1" />
          <rect x="79" y="30" width="7" height="13" rx="3.5" fill="#2b3550" stroke={EYE} strokeWidth="1" />
        </svg>
        <span className="lx-eyes lx-eyes-try">
          <i />
          <i />
        </span>
        <span className="lx-eyes lx-eyes-joy">
          <i />
          <i />
        </span>
        {/* Shine on the visor, from the polishing */}
        <span className="lx-glint" style={at(33, 13, 12)} />
        <span className="lx-glint" style={at(58, 21, 9, { animationDelay: "-0.9s" })} />
      </div>
    </div>
  );
}

/** The small Auras at work, each flying off its own way at lift-off. */
function Crew({ uid }: { uid: string }) {
  return (
    <>
      {/* On the gantry: tightens the bolts */}
      <Member uid={uid} style={{ ...at(27, 43.6, 11), ...flee("-260%", "-140%", 0.05) }} bob={-0.4} arm={-90}>
        <span className="lx-tool lx-wrench" style={at(88, 50, 46)}>
          <Wrench />
        </span>
      </Member>
      {/* Polishes the cockpit */}
      <Member uid={uid} style={{ ...at(59.2, 33, 10), ...flee("240%", "-220%", 0) }} bob={-1.1} arm={-100} flip>
        <span className="lx-tool lx-rag" style={at(86, 45, 30)}>
          <Rag />
        </span>
      </Member>
      {/* Welds the body */}
      <Member uid={uid} style={{ ...at(61.5, 56, 11), ...flee("260%", "-60%", 0.1) }} bob={-0.7} arm={-90} flip>
        <span className="lx-tool" style={at(88, 51, 30)}>
          <Torch />
        </span>
        <span className="lx-arc" style={at(108, 50, 20)} />
        {[
          ["-120%", "-160%"],
          ["-60%", "-220%"],
          ["40%", "-190%"],
          ["-160%", "60%"],
          ["-90%", "150%"],
        ].map(([x, y], i) => (
          <span key={i} className="lx-spark" style={{ ...at(116, 56, 6), "--sx": x, "--sy": y, animationDelay: `${-i * 0.14}s` } as CSSProperties} />
        ))}
      </Member>
      {/* Flies in the parts, round and round the ship */}
      <div className="lx-crew" style={{ ...at(45.5, 31.8, 9), ...flee("120%", "-400%", 0) }}>
        <div className="lx-orbit-x">
          <div className="lx-orbit-y">
            <Member uid={uid} bob={-0.2} arm={-60}>
              <span className="lx-tool lx-gear" style={at(80, 52, 34)}>
                <Gear />
              </span>
            </Member>
          </div>
        </div>
      </div>
      {/* Ticks off the checklist */}
      <Member uid={uid} style={{ ...at(22, 68, 10), ...flee("-260%", "40%", 0.15) }} bob={-1.6} arm={30}>
        <span className="lx-tool" style={at(52, 56, 34)}>
          <Clipboard />
        </span>
        <span className="lx-tick" style={at(70, -34, 42)}>
          ✓
        </span>
      </Member>
    </>
  );
}

const HEAD = "M20 2.5 C31 2.5 36.5 8 36.5 14.5 C36.5 21 30 25 20 25 C10 25 3.5 21 3.5 14.5 C3.5 8 9 2.5 20 2.5 Z";
const VISOR = "M20 7 C28 7 31.5 10.5 31.5 14.5 C31.5 18.5 27 21 20 21 C13 21 8.5 18.5 8.5 14.5 C8.5 10.5 12 7 20 7 Z";

/**
 * A small Aura in a hard hat, its right arm at `arm` degrees (0 hangs down, -90 points ahead). Without a
 * `style` it fills its parent; `flip` faces it left. Its tools (`children`) are placed on top in % of it.
 */
function Member({ uid, style, bob, arm, flip, children }: { uid: string; style?: CSSProperties; bob: number; arm: number; flip?: boolean; children?: ReactNode }) {
  const shell = `url(#${uid}-shell)`;
  const body = (
    <div className="lx-bob" style={{ animationDelay: `${bob}s` }}>
      <div className={flip ? "lx-flip" : undefined}>
        <svg viewBox="0 0 40 46" className="lx-member" focusable="false">
          <ellipse cx="20" cy="44" rx="7" ry="1.4" fill="currentColor" opacity="0.12" />
          <ellipse cx="9.5" cy="31" rx="2.6" ry="4.4" fill={shell} />
          <ellipse cx="20" cy="31.5" rx="9.5" ry="8.5" fill={shell} stroke="var(--aura-edge, #c9d4e5)" strokeWidth="0.6" />
          <circle cx="20" cy="31" r="2.2" fill={EYE} />
          <path d={HEAD} fill={shell} stroke="var(--aura-edge, #c9d4e5)" strokeWidth="0.6" />
          <path d={VISOR} fill={`url(#${uid}-visor)`} />
          <g fill={EYE}>
            <ellipse cx="16.5" cy="14.5" rx="2.1" ry="2.8" />
            <ellipse cx="25.5" cy="14.5" rx="2.1" ry="2.8" />
          </g>
          <path d="M7.5 7 C7.5 -3 32.5 -3 32.5 7 Z" fill={HAZARD} />
          <rect x="4" y="5.6" width="32" height="2.8" rx="1.4" fill="#e09a12" />
          <rect x="18.6" y="-1.4" width="2.8" height="7" rx="1.4" fill="#ffe08f" />
          <ellipse cx="30.5" cy="31" rx="2.6" ry="4.4" transform={`rotate(${arm} 30.5 27)`} fill={shell} />
        </svg>
        {children}
      </div>
    </div>
  );
  return style ? (
    <div className="lx-crew" style={style}>
      {body}
    </div>
  ) : (
    body
  );
}

/* Tools, each drawn pointing right from where it is held (the left middle). */

function Wrench() {
  return (
    <svg viewBox="0 0 24 10" focusable="false">
      <rect x="0" y="3.6" width="15" height="2.8" rx="1.4" fill="#a3b1c6" />
      <path d="M14 1 H18.5 A4.5 4.5 0 1 1 18.5 9 H14 Z M17.2 3.3 V6.7 H24 V3.3 Z" fill="#a3b1c6" fillRule="evenodd" />
    </svg>
  );
}

function Rag() {
  return (
    <svg viewBox="0 0 14 12" focusable="false">
      <path d="M0 4 Q7 0 13 3 L12 10 Q6 12 1 9 Z" fill="#ff8fb8" />
      <path d="M3 5 Q7 3.5 10 5" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1" />
    </svg>
  );
}

function Torch() {
  return (
    <svg viewBox="0 0 14 8" focusable="false">
      <rect x="0" y="1.5" width="8" height="5" rx="2" fill={STEEL_DARK} />
      <rect x="7.5" y="2.8" width="5" height="2.4" rx="0.6" fill="#a3b1c6" />
    </svg>
  );
}

function Gear() {
  return (
    <svg viewBox="-8 -8 16 16" focusable="false">
      <g fill="#ffab7a">
        {[0, 45, 90, 135].map((a) => (
          <rect key={a} x="-1.6" y="-7.5" width="3.2" height="15" rx="0.9" transform={`rotate(${a})`} />
        ))}
        <circle r="5.2" />
      </g>
      <circle r="2" fill={STEEL_DARK} />
    </svg>
  );
}

function Clipboard() {
  return (
    <svg viewBox="0 0 12 15" focusable="false">
      <rect x="0" y="1" width="12" height="14" rx="1.6" fill="#7cc3ff" />
      <rect x="1.4" y="3" width="9.2" height="10.6" rx="1" fill="#fff" />
      <rect x="3.6" y="0" width="4.8" height="2.6" rx="1" fill={STEEL} />
      {[5.2, 8, 10.8].map((y) => (
        <rect key={y} x="3" y={y - 0.5} width="6" height="1" rx="0.5" fill="#cbd5e1" />
      ))}
    </svg>
  );
}
