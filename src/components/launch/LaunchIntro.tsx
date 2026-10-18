"use client";

import "@/components/aura/aura.css";
import "./launch.css";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode, type RefObject } from "react";
import { AuraArt } from "@/components/aura/AuraArt";
import { AURA_EYES } from "@/components/aura/presets";
import { buttonClasses } from "@/components/ui/Button";
import type { PageCopy } from "@/lib/schema/page-copy";
import { LAUNCH_KEY } from "./flag";

/*
 * The home page's launch intro. While the page loads, Aura sits on her booster trying to take off
 * (it sputters, hops and drops back) while small Auras in hard hats work on the ship: one tightens
 * bolts from the gantry, one welds a fin, one polishes her visor, one flies in parts, one runs the
 * fuel and one ticks off the checklist. Once the page has loaded she lifts off, the smoke fills the
 * screen, and as it clears the landing page is there, with the hero's Aura flying down into place.
 *
 * flag.ts decides whether it plays before the first paint; launch.css draws every phase from
 * .launch[data-phase]: work → lift → clear, or skip.
 */

type Phase = "work" | "lift" | "clear" | "skip" | "gone";

/* Timings in ms; launch.css is written to match. */
const MIN_WORK = 3000; // Aura keeps trying at least this long after the page started loading…
const MAX_WORK = 8000; // …and lifts off by now even if it is still loading.
const ATTEMPT = 2200; // one take-off attempt (launch-attempt)
const LIFT = 2600; // lift-off, until the smoke covers the screen
const CLEAR = 1700; // the smoke clearing
const SKIP = 450;
const STEP = 1100; // each line of the checklist
const FAILSAFE = 16000; // launch.css hides an intro that never got going by then

const EYE = AURA_EYES.aqua;
const EDGE = "var(--aura-edge, #c9d4e5)";
const STEEL = "#5b6b86";
const STEEL_DARK = "#3b4763";
const STEEL_LIGHT = "#a3b1c6";
const HAZARD = "#ffc95c";
const HAZARD_DARK = "#e09a12";
const FIN = "#b9a3ff";

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

/** The drawing's frame (launch.css sizes .launch-scene to the same 400 × 296). */
const VIEWBOX = "0 110 400 296";

const STARS: [number, number, number][] = [
  [26, 130, 1.4],
  [56, 176, 1.1],
  [128, 122, 1.2],
  [282, 124, 1.6],
  [356, 168, 1.2],
  [384, 126, 1.1],
  [236, 116, 1],
];

/* The <html data-launch> flag is the source of truth: "run" while the intro plays, then "done"; absent when it doesn't play. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-launch"] });
  return () => observer.disconnect();
}
const readFlag = () => document.documentElement.dataset.launch ?? "";

/** How long until the ship is back on the pad between two attempts, so that lift-off starts from rest. */
function untilRest(ship: Element | null) {
  const attempt = ship?.getAnimations?.().find((a) => a instanceof CSSAnimation && a.animationName === "launch-attempt");
  const at = (Number(attempt?.currentTime ?? 0) % ATTEMPT) / ATTEMPT;
  return at < 0.35 ? 0 : (1 - at) * ATTEMPT;
}

export function LaunchIntro({ eventName, text }: { eventName: string; text: PageCopy["homeIntro"] }) {
  const flag = useSyncExternalStore(subscribe, readFlag, () => "run");
  const [phase, setPhase] = useState<Phase>("work");
  const [step, setStep] = useState(0);
  const ship = useRef<SVGGElement>(null);
  const skipButton = useRef<HTMLButtonElement>(null);
  const skip = useRef<() => void>(null);
  const uid = `launch${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    const html = document.documentElement;
    if (html.dataset.launch !== "run") return;
    // Mounted so late that launch.css has already hidden the overlay: let it go quietly.
    if (performance.now() > FAILSAFE - 2000) {
      html.dataset.launch = "done";
      return;
    }
    const timers: number[] = [];
    const after = (ms: number, fn: () => void) => void timers.push(window.setTimeout(fn, ms));
    const remember = () => {
      try {
        sessionStorage.setItem(LAUNCH_KEY, "1");
      } catch {}
    };
    let stage: "work" | "lift" | "over" = "work";
    // Escape skips; Tab stays on the skip button, as everything else is behind the intro.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip.current?.();
      else if (e.key === "Tab" && skipButton.current) {
        e.preventDefault();
        skipButton.current.focus();
      }
    };
    const reveal = () => {
      stage = "over";
      window.removeEventListener("keydown", onKey);
      setPhase("clear");
      after(CLEAR, () => setPhase("gone"));
    };
    const lift = () => {
      if (stage !== "work") return;
      stage = "lift";
      after(untilRest(ship.current), () => {
        remember();
        setPhase("lift");
        after(LIFT, reveal);
      });
    };
    skip.current = () => {
      if (stage === "over") return;
      stage = "over";
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", onKey);
      remember();
      setPhase("skip");
      after(SKIP, () => setPhase("gone"));
    };
    // `performance.now()` counts from when the page started loading, as the overlay has been up since then.
    const loaded = () => after(Math.max(0, MIN_WORK - performance.now()), lift);
    if (document.readyState === "complete") loaded();
    else window.addEventListener("load", loaded, { once: true });
    after(Math.max(0, MAX_WORK - performance.now()), lift);
    window.addEventListener("keydown", onKey);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("load", loaded);
      window.removeEventListener("keydown", onKey);
      skip.current = null;
    };
  }, []);

  // The page behind is let go (scrolling, the hero Aura's fly-in) once the overlay is on its way out.
  useEffect(() => {
    if (phase === "clear" || phase === "skip") document.documentElement.dataset.launch = "done";
  }, [phase]);

  const working = phase === "work" && flag === "run";
  useEffect(() => {
    if (!working) return;
    const t = window.setInterval(() => setStep((i) => i + 1), STEP);
    return () => window.clearInterval(t);
  }, [working]);

  const shown = phase !== "gone" && (flag === "run" || (flag === "done" && (phase === "clear" || phase === "skip")));
  if (!shown) return null;

  const steps = [text.step1, text.step2, text.step3, text.step4].filter(Boolean);
  const paint: Paint = { shell: `url(#${uid}-shell)`, visor: `url(#${uid}-visor)` };

  return (
    <div className="launch" data-phase={phase} data-edit="home.intro">
      <div className="launch-sky" aria-hidden />
      <div className="launch-stage">
        <div className="launch-scene" aria-hidden>
          <Ground uid={uid} />
          <div className="launch-billows">
            {BILLOWS.map(([x, y, s, d], i) => (
              <span key={i} className="launch-puff" style={{ "--x": x, "--y": y, "--s": s, "--d": `${d}ms`, "--d2": `${(i % 4) * 70}ms` } as CSSProperties}>
                <span />
              </span>
            ))}
          </div>
          <Ship uid={uid} paint={paint} shipRef={ship} lifting={phase !== "work"} />
          <Crew paint={paint} />
        </div>
        <div className="launch-status">
          <p className="text-[11px] font-bold tracking-[0.2em] text-subtle uppercase">
            <span className="inline-block">{eventName}</span>
            {text.kicker ? (
              <>
                {" "}
                <span className="inline-block">· {text.kicker}</span>
              </>
            ) : null}
          </p>
          <p className="launch-line font-display text-xl font-semibold text-fg sm:text-2xl" aria-hidden>
            {phase === "work" ? (
              steps.length ? (
                <span key={step}>
                  {steps[step % steps.length]}
                  <span className="launch-dots">
                    <i>.</i>
                    <i>.</i>
                    <i>.</i>
                  </span>
                </span>
              ) : null
            ) : (
              <span className="text-gradient">{text.liftoff}</span>
            )}
          </p>
          <div className="launch-bar">
            <span />
          </div>
        </div>
      </div>
      <div className="launch-fog" aria-hidden />
      <p role="status" className="sr-only">
        {text.status}
      </p>
      {phase === "work" || phase === "lift" ? (
        <button ref={skipButton} type="button" onClick={() => skip.current?.()} className={buttonClasses("outline", "sm", "launch-skip")}>
          {text.skip}
        </button>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------ Drawing -- */

interface Paint {
  shell: string;
  visor: string;
}

/** Gradients shared by the layers (ids are page-wide, so one set is enough). */
function Defs({ uid }: { uid: string }) {
  return (
    <defs>
      <radialGradient id={`${uid}-shell`} cx="38%" cy="28%" r="80%">
        <stop offset="0%" stopColor="var(--aura-body-1, #fff)" />
        <stop offset="60%" stopColor="var(--aura-body-2, #f1f5fb)" />
        <stop offset="100%" stopColor="var(--aura-body-3, #d3ddec)" />
      </radialGradient>
      <linearGradient id={`${uid}-visor`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--aura-visor-1, #1d2946)" />
        <stop offset="100%" stopColor="var(--aura-visor-2, #060a14)" />
      </linearGradient>
      <linearGradient id={`${uid}-hull`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="var(--aura-body-3, #d3ddec)" />
        <stop offset="38%" stopColor="var(--aura-body-1, #fff)" />
        <stop offset="100%" stopColor="var(--aura-body-3, #d3ddec)" />
      </linearGradient>
      <linearGradient id={`${uid}-flame`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fff3b0" />
        <stop offset="35%" stopColor="#ffc53d" />
        <stop offset="75%" stopColor="#ff7a45" />
        <stop offset="100%" stopColor="#ff7a45" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={`${uid}-glow`}>
        <stop offset="0%" stopColor="#ffd27a" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#ffd27a" stopOpacity="0" />
      </radialGradient>
      <clipPath id={`${uid}-stripes`}>
        <rect x="132" y="372" width="136" height="7" rx="1.5" />
      </clipPath>
    </defs>
  );
}

/** Behind the smoke: stars, the gantry, the launch pad and the fuel tank with its hose. */
function Ground({ uid }: { uid: string }) {
  const braces = Array.from({ length: 8 }, (_, i) => `M77 ${172 + i * 26} L97 ${185 + i * 26} L77 ${198 + i * 26}`).join(" ");
  const hose = "M300 352 C282 378 246 364 229 328";
  return (
    <svg viewBox={VIEWBOX} className="launch-layer" focusable="false">
      <Defs uid={uid} />
      {STARS.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} className="launch-star launch-w" style={{ animationDelay: `${-i * 0.7}s` }} />
      ))}
      <ellipse cx="200" cy="388" rx="196" ry="10" className="launch-floor" />

      {/* Gantry, with the platform that swings away at lift-off */}
      <rect x="72" y="168" width="5" height="216" rx="1.5" fill={STEEL} />
      <rect x="97" y="168" width="5" height="216" rx="1.5" fill={STEEL} />
      <path d={braces} fill="none" stroke={STEEL_LIGHT} strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="67" y="161" width="40" height="7" rx="2" fill={STEEL_DARK} />
      <rect x="85" y="151" width="4" height="10" fill={STEEL_DARK} />
      <circle cx="87" cy="149" r="4" className="launch-beacon" />
      <g className="launch-arm">
        <path d="M102 300 L134 274" stroke={STEEL} strokeWidth="2.5" strokeLinecap="round" />
        <rect x="100" y="270" width="70" height="5" rx="1.5" fill={STEEL_DARK} />
      </g>

      {/* Launch pad */}
      <rect x="146" y="362" width="108" height="7" rx="2" fill={STEEL} />
      <rect x="128" y="369" width="144" height="14" rx="3" fill="#1f2638" />
      <g clipPath={`url(#${uid}-stripes)`} fill={HAZARD}>
        {Array.from({ length: 11 }, (_, i) => (
          <path key={i} d={`M${124 + i * 14} 379 l7 -7 h6 l-7 7 Z`} />
        ))}
      </g>
      <rect x="138" y="383" width="10" height="4" fill={STEEL_DARK} />
      <rect x="252" y="383" width="10" height="4" fill={STEEL_DARK} />

      {/* Fuel: the hose comes off at lift-off */}
      <g className="launch-hose">
        <path d={hose} fill="none" stroke={STEEL_DARK} strokeWidth="4" strokeLinecap="round" />
        <path d={hose} fill="none" stroke={EYE} strokeWidth="1.5" strokeDasharray="3 6" strokeLinecap="round" className="launch-fuel launch-w" />
      </g>
      <rect x="300" y="314" width="42" height="70" rx="13" fill={HAZARD} stroke={HAZARD_DARK} strokeWidth="1.5" />
      <rect x="300.75" y="334" width="40.5" height="9" fill="#ffffff" opacity="0.55" />
      <circle cx="321" cy="362" r="7" fill="#ffffff" stroke={STEEL_DARK} strokeWidth="1.6" />
      <path d="M321 362 L325 357" stroke="#ff6b6b" strokeWidth="1.6" strokeLinecap="round" className="launch-needle launch-w" />
      <g transform="translate(344 347)">
        <g className="launch-valve launch-w" fill="none" stroke="#ff6b6b">
          <circle r="5.5" strokeWidth="2" />
          <path d="M-5.5 0 H5.5 M0 -5.5 V5.5" strokeWidth="1.5" />
        </g>
      </g>

      {/* A puff of exhaust on every try */}
      {[
        [-22, 180, 364, 7],
        [22, 220, 364, 7],
        [0, 200, 368, 8],
      ].map(([dx, cx, cy, r]) => (
        <circle key={dx} cx={cx} cy={cy} r={r} className="launch-puff-try" style={{ "--dx": `${dx}px` } as CSSProperties} />
      ))}
    </svg>
  );
}

/** Aura on her booster: above the smoke, so she stays in sight as she climbs out of it. */
function Ship({ uid, paint, shipRef, lifting }: { uid: string; paint: Paint; shipRef: RefObject<SVGGElement | null>; lifting: boolean }) {
  return (
    <svg viewBox={VIEWBOX} className="launch-layer" focusable="false">
      <g ref={shipRef} className="launch-ship">
        <circle cx="200" cy="374" r="34" fill={`url(#${uid}-glow)`} className="launch-glow" />
        <g transform="translate(200 360)">
          <g className="launch-flame">
            <path d="M-13 0 C-13 16 -5 30 0 48 C5 30 13 16 13 0 Z" fill={`url(#${uid}-flame)`} />
            <path d="M-6.5 0 C-6.5 9 -2.5 18 0 28 C2.5 18 6.5 9 6.5 0 Z" fill="#fff6cf" className="launch-core" />
          </g>
        </g>
        {/* Fins */}
        <g fill={FIN} stroke="#8f78ea" strokeWidth="1.2" strokeLinejoin="round">
          <path d="M175 292 C160 304 150 326 147 360 L156 360 L174 342 Z" />
          <path d="M225 292 C240 304 250 326 253 360 L244 360 L226 342 Z" />
        </g>
        {/* Nozzle */}
        <path d="M186 345 L214 345 L220 358 L180 358 Z" fill={STEEL_DARK} />
        <rect x="178" y="356" width="44" height="5" rx="2" fill={STEEL} />
        {/* Booster */}
        <path
          d="M172 250 Q172 244 178 244 L222 244 Q228 244 228 250 L228 334 Q228 346 214 346 L186 346 Q172 346 172 334 Z"
          fill={`url(#${uid}-hull)`}
          stroke={EDGE}
          strokeWidth="1.2"
        />
        <rect x="172" y="286" width="56" height="7" fill={EYE} opacity="0.85" />
        <circle cx="200" cy="315" r="9" fill={paint.visor} stroke={STEEL} strokeWidth="2" />
        <path d="M200 309 Q201 314 206 315 Q201 316 200 321 Q199 316 194 315 Q199 314 200 309 Z" fill={EYE} />
        <g fill="var(--aura-line, #93a4be)" opacity="0.6">
          {[180, 192, 208, 220].map((x) => (
            <circle key={x} cx={x} cy="270" r="1.2" />
          ))}
          {[184, 216].map((x) => (
            <circle key={x} cx={x} cy="336" r="1.2" />
          ))}
        </g>
        <rect x="225" y="321" width="5" height="8" rx="1.5" fill={STEEL_DARK} />
        {/* Aura, as the capsule, with her headset on */}
        <g transform="translate(135 128) scale(0.5)">
          <AuraArt
            uid={`${uid}-aura`}
            expression={lifting ? "star" : "determined"}
            pose={lifting ? "cheer" : "raise"}
            headwear="headset"
            emblem="spark"
            eyeColor={EYE}
            className="aura-svg"
            width={260}
            height={300}
          />
        </g>
        {/* The rim of the booster's top, in front of her */}
        <path d="M169 250 A31 7 0 0 0 231 250 L231 255 A31 7 0 0 1 169 255 Z" fill={STEEL} />
        <path d="M172 252.5 A28 5.6 0 0 0 228 252.5" fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1" />
      </g>
    </svg>
  );
}

/** The small Auras at work, each fleeing in its own direction at lift-off. */
function Crew({ paint }: { paint: Paint }) {
  return (
    <svg viewBox={VIEWBOX} className="launch-layer" focusable="false">
      {/* Checks the list */}
      <Helper paint={paint} x={22} y={338} s={0.8} arm={35} look={[2, -1.6]} flee={[-210, -10, 0.2]} bob={-0.3} tool={<g transform="rotate(-35)"><Clipboard /></g>} />
      {/* Tightens the bolts from the gantry */}
      <Helper paint={paint} x={126} y={236} s={0.75} arm={-90} swing="launch-ratchet" look={[2, 0]} flee={[-230, -90, 0.05]} bob={-0.9} tool={<Wrench />}>
        <Spark className="launch-clank launch-w" x={58} y={27} fill="#ffc53d" />
      </Helper>
      {/* Polishes Aura's visor */}
      <Helper paint={paint} x={143} y={150} s={0.7} arm={-104} swing="launch-polish" look={[2, -0.5]} flee={[-220, -170, 0]} bob={-1.3} tool={<Rag />} />
      <Spark className="launch-shine launch-w" x={190} y={170} />
      <Spark className="launch-shine launch-w" x={215} y={180} delay={-0.9} />
      {/* Welds a fin */}
      <Helper paint={paint} x={246} y={290} s={0.75} flip arm={-90} swing="launch-weld" look={[2, 0.5]} flee={[240, -60, 0.08]} bob={-0.5} tool={<Torch />} />
      {/* Flies in the parts */}
      <g data-flee="" style={flee(220, -170, 0)}>
        <g className="launch-carry launch-w">
          <Helper
            paint={paint}
            x={318}
            y={128}
            s={0.65}
            flip
            arm={-90}
            swing="launch-twist"
            look={[2, 1]}
            bob={-0.2}
            tool={
              <g className="launch-cargo launch-w" transform="translate(0 6)">
                <Gear />
              </g>
            }
          />
        </g>
      </g>
      {/* Opens the fuel valve */}
      <Helper paint={paint} x={346} y={326} s={0.7} flip arm={-90} swing="launch-crank" look={[2, 0.5]} flee={[230, 20, 0.15]} bob={-1.1} />
    </svg>
  );
}

const flee = (x: number, y: number, delay: number) => ({ "--fx": `${x}px`, "--fy": `${y}px`, "--fd": `${delay}s` }) as CSSProperties;

const HEAD = "M20 2.5 C31 2.5 36.5 8 36.5 14.5 C36.5 21 30 25 20 25 C10 25 3.5 21 3.5 14.5 C3.5 8 9 2.5 20 2.5 Z";
const VISOR = "M20 7 C28 7 31.5 10.5 31.5 14.5 C31.5 18.5 27 21 20 21 C13 21 8.5 18.5 8.5 14.5 C8.5 10.5 12 7 20 7 Z";

/**
 * A small Aura in a hard hat: a 40 × 46 drawing like MiniAura, with its top left at x, y, scaled by s
 * (`flip` faces it left). Its right arm turns from the shoulder (0° hangs down, -90° points ahead), may
 * move with a `swing` animation and holds `tool`. `children` are drawn in the same 40 × 46 space.
 */
function Helper({
  paint,
  x,
  y,
  s = 0.75,
  flip = false,
  arm = 8,
  swing,
  tool,
  look = [0, 0],
  flee: away,
  bob = 0,
  children,
}: {
  paint: Paint;
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  arm?: number;
  swing?: string;
  tool?: ReactNode;
  look?: [number, number];
  /** Where it flies off to at lift-off, and after how many seconds. */
  flee?: [number, number, number];
  /** Offset (s) of its hovering, so the crew doesn't bob in step. */
  bob?: number;
  children?: ReactNode;
}) {
  return (
    <g data-flee={away ? "" : undefined} style={{ ...(away ? flee(...away) : null), "--d": `${bob}s` } as CSSProperties}>
      <g transform={`translate(${flip ? x + 40 * s : x} ${y}) scale(${flip ? -s : s} ${s})`}>
        <g className="launch-bob launch-w">
          <ellipse cx="9.5" cy="31" rx="2.6" ry="4.4" fill={paint.shell} stroke={EDGE} strokeWidth="0.8" />
          <ellipse cx="20" cy="31.5" rx="9.5" ry="8.5" fill={paint.shell} stroke={EDGE} strokeWidth="0.8" />
          <circle cx="20" cy="31" r="2.2" fill={EYE} />
          <path d={HEAD} fill={paint.shell} stroke={EDGE} strokeWidth="0.8" />
          <path d={VISOR} fill={paint.visor} />
          <g transform={`translate(${look[0]} ${look[1]})`}>
            <g className="launch-blink launch-w" fill={EYE}>
              <ellipse cx="15.5" cy="14.5" rx="2.1" ry="2.8" />
              <ellipse cx="24.5" cy="14.5" rx="2.1" ry="2.8" />
            </g>
          </g>
          {/* Hard hat */}
          <path d="M7.5 7 C7.5 -3 32.5 -3 32.5 7 Z" fill={HAZARD} />
          <rect x="4" y="5.6" width="32" height="2.8" rx="1.4" fill={HAZARD_DARK} />
          <rect x="18.6" y="-1.4" width="2.8" height="7" rx="1.4" fill="#ffe08f" />
          {children}
          <g transform={`translate(30.5 27) rotate(${arm})`}>
            <g className={swing ? `launch-swing launch-w ${swing}` : undefined}>
              <ellipse cx="0" cy="4" rx="2.6" ry="4.4" fill={paint.shell} stroke={EDGE} strokeWidth="0.8" />
              {tool ? <g transform="translate(0 8)">{tool}</g> : null}
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}

/* Tools, drawn from the hand outwards along the arm (+y). */

function Wrench() {
  return (
    <g fill={STEEL_LIGHT}>
      <rect x="-1.5" y="-1" width="3" height="12" rx="1.5" />
      <path d="M-4.4 10 H4.4 V15.5 L1.7 18.5 V13.6 H-1.7 V18.5 L-4.4 15.5 Z" />
    </g>
  );
}

const SPARKS: [number, number][] = [
  [-9, -4],
  [-5, -9],
  [2, -10],
  [-11, 2],
  [-8, 6],
  [-3, -7],
];

function Torch() {
  return (
    <g>
      <rect x="-2.2" y="-1" width="4.4" height="9" rx="1.6" fill={STEEL_DARK} />
      <rect x="-1.2" y="7.5" width="2.4" height="4.5" fill={STEEL_LIGHT} />
      <g transform="translate(0 14)">
        <circle r="4.6" fill="#bff3ff" className="launch-arc launch-w" />
        <circle r="1.8" fill="#ffffff" />
        {SPARKS.map(([sx, sy], i) => (
          <circle key={i} r="0.9" fill="#ffd166" className="launch-spark launch-w" style={{ "--sx": `${sx}px`, "--sy": `${sy}px`, animationDelay: `${-i * 0.09}s` } as CSSProperties} />
        ))}
      </g>
    </g>
  );
}

function Rag() {
  return <path d="M-3.5 -0.5 H3.5 L4.5 8 Q0 9.6 -4.5 8 Z" fill="#ff8fb8" />;
}

function Gear() {
  return (
    <g className="launch-gear launch-w" fill="#ffab7a">
      {[0, 45, 90, 135].map((a) => (
        <rect key={a} x="-1.5" y="-6.8" width="3" height="13.6" rx="0.8" transform={`rotate(${a})`} />
      ))}
      <circle r="4.8" />
      <circle r="1.9" fill={STEEL_DARK} />
    </g>
  );
}

function Clipboard() {
  return (
    <g>
      <rect x="-6" y="-1" width="12" height="15" rx="1.6" fill="#7cc3ff" />
      <rect x="-4.6" y="1" width="9.2" height="11.6" rx="1" fill="#ffffff" />
      <rect x="-2.4" y="-2.2" width="4.8" height="2.6" rx="1" fill={STEEL} />
      {[3.6, 6.9, 10.2].map((ty, i) => (
        <g key={ty}>
          <path
            d={`M-3.6 ${ty} l1 1 l1.8 -2`}
            fill="none"
            stroke="#14a874"
            strokeWidth="0.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="launch-tick launch-w"
            style={{ animationDelay: `${i * 0.7}s` }}
          />
          <rect x="-0.2" y={ty - 0.5} width={i === 1 ? 3 : 3.8} height="1" rx="0.5" fill="#cbd5e1" />
        </g>
      ))}
    </g>
  );
}

/** A four-pointed glint: a bolt clanking home, or a shine on the polished visor. */
function Spark({ x, y, className, fill = "#ffffff", delay = 0 }: { x: number; y: number; className: string; fill?: string; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 -5 Q0.9 -0.9 5 0 Q0.9 0.9 0 5 Q-0.9 0.9 -5 0 Q-0.9 -0.9 0 -5 Z" fill={fill} className={className} style={delay ? { animationDelay: `${delay}s` } : undefined} />
    </g>
  );
}
