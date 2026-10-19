import type { CSSProperties, ReactNode } from "react";
import type { AuraLook, Effect, Emblem, Expression, Headwear, Pose, PropKind } from "./types";
import { AURA_EYES } from "./presets";

/*
 * Aura: an original, EVE-inspired agentic AI mascot: a glossy, egg-shaped
 * hovering robot with a floating head, a dark visor with glowing eyes and
 * fin-like arms. Pure SVG with no hooks so it can be rendered on the server,
 * in client components and inside OG images.
 */

export const AURA_W = 260;
export const AURA_H = 300;

const ARM_LEN = 54;
const PIVOT_L = { x: 62, y: 170 };
const PIVOT_R = { x: 198, y: 170 };
const EYE_L = { x: 110, y: 102 };
const EYE_R = { x: 150, y: 102 };
const CHEST = { x: 130, y: 207 };

const ARM_PATH =
  "M0 -6 C9.5 -6 13.5 5 13 21 C12.5 37 7 51 0 54 C-7 51 -12.5 37 -13 21 C-13.5 5 -9.5 -6 0 -6 Z";
const HEAD_PATH =
  "M130 52 C170 52 194 74 194 101 C194 128 168 144 130 144 C92 144 66 128 66 101 C66 74 90 52 130 52 Z";
const VISOR_PATH =
  "M130 68 C161 68 180 83 180 103 C180 122 160 133 130 133 C100 133 80 122 80 103 C80 83 99 68 130 68 Z";
const BODY_PATH =
  "M130 150 C168 150 194 166 194 198 C194 234 166 264 130 264 C94 264 66 234 66 198 C66 166 92 150 130 150 Z";
const HEART_PATH =
  "M0 17 C-6 12 -21 3 -21 -7 C-21 -14 -15.5 -19 -9.5 -19 C-5 -19 -1.6 -16.3 0 -12.6 C1.6 -16.3 5 -19 9.5 -19 C15.5 -19 21 -14 21 -7 C21 3 6 12 0 17 Z";
const SPARK_PATH = "M0 -11 Q1.8 -1.8 11 0 Q1.8 1.8 0 11 Q-1.8 1.8 -11 0 Q-1.8 -1.8 0 -11 Z";

const FRONT_PROPS = new Set<PropKind>([
  "clipboard", "book", "tablet", "laptop", "camera", "bigHeart", "heartPulse", "ticket", "stopwatch",
]);

type ArmPose = { l: number; r: number; wave?: "l" | "r" | "both"; sway?: boolean; tap?: boolean };

export const POSES: Record<Pose, ArmPose> = {
  idle: { l: 7, r: -7, sway: true },
  wave: { l: 7, r: -140, wave: "r" },
  hold: { l: 7, r: 40 },
  holdBoth: { l: -45, r: 45 },
  holdSide: { l: 7, r: -25 },
  raise: { l: 7, r: -155 },
  /** Right arm up (holding a placard, say) while the left one waves. */
  raiseWave: { l: 140, r: -155, wave: "l" },
  toFace: { l: 7, r: 150 },
  point: { l: 7, r: -80 },
  think: { l: -150, r: -7 },
  cheer: { l: 150, r: -150, wave: "both" },
  type: { l: -48, r: 48, tap: true },
};

function armTip(pivot: { x: number; y: number }, deg: number) {
  const t = (deg * Math.PI) / 180;
  return { x: pivot.x - ARM_LEN * Math.sin(t), y: pivot.y + ARM_LEN * Math.cos(t) };
}

export type AuraPalette = "css" | "light" | "dark";

const PALETTES = {
  light: {
    body1: "#ffffff",
    body2: "#f1f5fb",
    body3: "#d3ddec",
    visor1: "#1d2946",
    visor2: "#060a14",
    shadow: "rgba(30,41,59,0.18)",
    line: "#93a4be",
    edge: "#c9d4e5",
  },
  dark: {
    body1: "#f7f9fd",
    body2: "#e3e9f4",
    body3: "#b9c5da",
    visor1: "#18223b",
    visor2: "#03060d",
    shadow: "rgba(0,0,0,0.5)",
    line: "#6d7d99",
    edge: "rgba(255,255,255,0)",
  },
};

export interface AuraArtProps extends AuraLook {
  uid: string;
  palette?: AuraPalette;
  className?: string;
  style?: CSSProperties;
  width?: number | string;
  height?: number | string;
  title?: string;
  /** Words on a placard held up in the right hand (draw her with a raised right arm: "raise" or "raiseWave"). */
  placard?: string;
}

export function AuraArt({
  uid,
  expression,
  pose,
  prop,
  headwear,
  wear,
  emblem = "spark",
  effects = [],
  eyeColor = AURA_EYES.aqua,
  palette = "css",
  className,
  style,
  width,
  height,
  title,
  placard,
}: AuraArtProps) {
  const id = (name: string) => `${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  const col = (key: keyof (typeof PALETTES)["light"], cssVar: string) =>
    palette === "css" ? `var(${cssVar}, ${PALETTES.light[key]})` : PALETTES[palette][key];

  const C = {
    body1: col("body1", "--aura-body-1"),
    body2: col("body2", "--aura-body-2"),
    body3: col("body3", "--aura-body-3"),
    visor1: col("visor1", "--aura-visor-1"),
    visor2: col("visor2", "--aura-visor-2"),
    shadow: col("shadow", "--aura-shadow"),
    line: col("line", "--aura-line"),
    edge: col("edge", "--aura-edge"),
    eye: eyeColor,
  };

  const arms = POSES[pose];
  const gripR = armTip(PIVOT_R, arms.r);
  const gripL = armTip(PIVOT_L, arms.l);
  const fx = new Set<Effect>(effects);
  const showCheeks = ["happy", "love", "wink", "star"].includes(expression);
  const showEmblem = !wear && !(prop && FRONT_PROPS.has(prop));

  return (
    <svg
      viewBox={`0 0 ${AURA_W} ${AURA_H}`}
      width={width}
      height={height}
      className={className}
      style={{ "--aura-phase": `${phaseFor(uid)}s`, ...style } as CSSProperties}
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <radialGradient id={id("body")} cx="38%" cy="26%" r="80%">
          <stop offset="0%" stopColor={C.body1} />
          <stop offset="55%" stopColor={C.body2} />
          <stop offset="100%" stopColor={C.body3} />
        </radialGradient>
        <linearGradient id={id("visor")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.visor1} />
          <stop offset="100%" stopColor={C.visor2} />
        </linearGradient>
        <radialGradient id={id("glow")}>
          <stop offset="0%" stopColor={C.eye} stopOpacity="0.55" />
          <stop offset="100%" stopColor={C.eye} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id("thrust")}>
          <stop offset="0%" stopColor={C.eye} stopOpacity="0.85" />
          <stop offset="100%" stopColor={C.eye} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("gold")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe795" />
          <stop offset="55%" stopColor="#ffc53d" />
          <stop offset="100%" stopColor="#e09a12" />
        </linearGradient>
        <linearGradient id={id("pink")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffc2d4" />
          <stop offset="100%" stopColor="#ff6f9c" />
        </linearGradient>
        <linearGradient id={id("party")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c7b5ff" />
          <stop offset="100%" stopColor="#ff8fb8" />
        </linearGradient>
        <linearGradient id={id("screen")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7be7ff" />
          <stop offset="100%" stopColor="#b9a3ff" />
        </linearGradient>
        <linearGradient id={id("silver")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id={id("flame")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe066" />
          <stop offset="100%" stopColor="#ff7a45" />
        </linearGradient>
        <linearGradient id={id("spot")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.eye} stopOpacity="0.2" />
          <stop offset="100%" stopColor={C.eye} stopOpacity="0" />
        </linearGradient>
        <clipPath id={id("visorClip")}>
          <path d={VISOR_PATH} />
        </clipPath>
        {/* Back and front halves of the orbit (behind and in front of the body), with room either side for the orbs. */}
        <clipPath id={id("orbitBack")}>
          <rect x="-40" y="0" width={AURA_W + 80} height="190" />
        </clipPath>
        <clipPath id={id("orbitFront")}>
          <rect x="-40" y="190" width={AURA_W + 80} height="110" />
        </clipPath>
      </defs>

      {/* Back layer */}
      {fx.has("spotlight") ? <path d="M130 -6 L40 296 L220 296 Z" fill={url("spot")} /> : null}
      {fx.has("pulse") ? (
        <g className="aura-pulse" fill="none" stroke={C.eye} strokeWidth="2">
          <ellipse cx="130" cy="288" rx="40" ry="7" />
          <ellipse cx="130" cy="288" rx="40" ry="7" className="aura-pulse-2" />
        </g>
      ) : null}
      {fx.has("orbit") ? <Orbit clip={url("orbitBack")} eye={C.eye} /> : null}

      <ellipse className="aura-shadow" cx="130" cy="288" rx="48" ry="7" fill={C.shadow} />

      <g className="aura-float">
        <g className="aura-react">
          {/* Hover thruster glow */}
          <ellipse className="aura-thrust" cx="130" cy="270" rx="22" ry="7" fill={url("thrust")} />

          {/* Body */}
          <path d={BODY_PATH} fill={url("body")} stroke={C.edge} strokeWidth="1.4" />
          <path
            d="M84 176 C92 162 108 156 122 155"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.9"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M178 226 C170 246 152 258 134 260"
            fill="none"
            stroke={C.line}
            strokeOpacity="0.25"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {showEmblem ? <ChestEmblem kind={emblem} eye={C.eye} glow={url("glow")} /> : null}
          {wear === "stethoscope" ? <Stethoscope silver={url("silver")} /> : null}

          {/* Levitation glow between head and body */}
          <ellipse cx="130" cy="147.5" rx="24" ry="2.6" fill={C.eye} opacity="0.35" />

          {/* Head */}
          <g className="aura-head-bob">
            <g className="aura-head">
              <path d={HEAD_PATH} fill={url("body")} stroke={C.edge} strokeWidth="1.4" />
              <path
                d="M86 74 C96 63 110 58 124 57"
                fill="none"
                stroke="#ffffff"
                strokeOpacity="0.95"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path d={VISOR_PATH} fill={url("visor")} />
              <path
                d="M95 82 C105 75 118 72 132 72"
                fill="none"
                stroke="#ffffff"
                strokeOpacity="0.16"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {showCheeks ? (
                <g className="aura-cheeks" fill="#ff8fb8" opacity="0.55">
                  <ellipse cx="93" cy="119" rx="7" ry="3.6" />
                  <ellipse cx="167" cy="119" rx="7" ry="3.6" />
                </g>
              ) : null}
              <g className="aura-eyes">
                <EyePair expression={expression} eye={C.eye} glow={url("glow")} magnify={prop === "magnifier"} />
              </g>
              {fx.has("scan") ? (
                <g clipPath={url("visorClip")}>
                  <rect className="aura-scan" x="80" y="70" width="100" height="3" rx="1.5" fill={C.eye} opacity="0.75" />
                </g>
              ) : null}
              {headwear ? <HeadwearArt kind={headwear} eye={C.eye} party={url("party")} /> : null}
            </g>
          </g>

          {/* Props held in front of the body (drawn before arms so hands overlap them) */}
          {prop ? (
            <PropArt
              kind={prop}
              gripR={gripR}
              gripL={gripL}
              eye={C.eye}
              line={C.line}
              url={url}
              waves={fx.has("waves")}
            />
          ) : null}
          {placard ? <Placard text={placard} grip={gripR} line={C.line} url={url} /> : null}

          {/* Arms */}
          <Arm pivot={PIVOT_L} deg={arms.l} side="l" fill={url("body")} edge={C.edge} anim={armAnim(arms, "l")} />
          <Arm pivot={PIVOT_R} deg={arms.r} side="r" fill={url("body")} edge={C.edge} anim={armAnim(arms, "r")} />
        </g>
      </g>

      {/* Front layer */}
      {fx.has("orbit") ? <Orbit clip={url("orbitFront")} eye={C.eye} /> : null}
      {fx.has("sparkles") ? <Sparkles eye={C.eye} clearTopRight={Boolean(placard)} /> : null}
      {fx.has("hearts") ? <FloatingHearts /> : null}
      {fx.has("code") ? <FloatingCode eye={C.eye} /> : null}
      {fx.has("zzz") ? <Zzz eye={C.eye} /> : null}
      {fx.has("question") ? <QuestionBubble eye={C.eye} line={C.line} /> : null}
      {fx.has("bulb") ? <IdeaBulb gold={url("gold")} /> : null}
      {fx.has("confetti") ? <Confetti /> : null}
      {fx.has("flash") ? (
        <g transform="translate(166 184) scale(1.6)">
          <path className="aura-flash" d={SPARK_PATH} fill="#ffffff" />
        </g>
      ) : null}
    </svg>
  );
}

/** Deterministic animation phase so several Auras on a page don't move in lockstep. */
function phaseFor(uid: string) {
  let h = 0;
  for (let i = 0; i < uid.length; i++) h = (h * 31 + uid.charCodeAt(i)) >>> 0;
  return -((h % 4000) / 1000);
}

function armAnim(pose: ArmPose, side: "l" | "r") {
  if (pose.wave === "both" || pose.wave === side) return "aura-arm-wave";
  if (pose.tap) return side === "l" ? "aura-arm-tap" : "aura-arm-tap aura-arm-tap-alt";
  if (pose.sway) return "aura-arm-sway";
  return "";
}

function Arm({
  pivot,
  deg,
  side,
  fill,
  edge,
  anim,
}: {
  pivot: { x: number; y: number };
  deg: number;
  side: "l" | "r";
  fill: string;
  edge: string;
  anim: string;
}) {
  return (
    <g transform={`translate(${pivot.x} ${pivot.y})`}>
      {/* The transform attribute renders the static pose (e.g. in OG images);
          when aura.css is loaded, CSS transforms take over and animate it. */}
      <g
        className={`aura-arm aura-arm-${side} ${anim}`}
        transform={`rotate(${deg})`}
        style={{ "--rot": `${deg}deg` } as CSSProperties}
      >
        <path d={ARM_PATH} fill={fill} stroke={edge} strokeWidth="1.4" />
        <path
          d={side === "l" ? "M-7 2 C-9 12 -9 24 -7 34" : "M7 2 C9 12 9 24 7 34"}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.85"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}

/* ----------------------------------------------------------------- Eyes -- */

function EyePair({
  expression,
  eye,
  glow,
  magnify,
}: {
  expression: Expression;
  eye: string;
  glow: string;
  magnify: boolean;
}) {
  const left: Expression = expression === "wink" ? "neutral" : expression;
  const right: Expression = expression === "wink" ? "happy" : expression;
  return (
    <>
      <ellipse cx={EYE_L.x} cy={EYE_L.y} rx="19" ry="21" fill={glow} className="aura-eye-glow" />
      <ellipse cx={EYE_R.x} cy={EYE_R.y} rx="19" ry="21" fill={glow} className="aura-eye-glow" />
      <g transform={`translate(${EYE_L.x} ${EYE_L.y})`}>
        <g className={blinks(left) ? "aura-eye aura-blink" : "aura-eye"}>
          <EyeShape kind={left} side="l" eye={eye} />
        </g>
      </g>
      <g transform={`translate(${EYE_R.x} ${EYE_R.y})${magnify ? " scale(1.45)" : ""}`}>
        <g className={blinks(right) ? "aura-eye aura-blink" : "aura-eye"}>
          <EyeShape kind={right} side="r" eye={eye} />
        </g>
      </g>
    </>
  );
}

function blinks(kind: Expression) {
  return !["happy", "sleepy", "code", "wink"].includes(kind);
}

function EyeShape({ kind, side, eye }: { kind: Expression; side: "l" | "r"; eye: string }) {
  const hl = <circle cx="-3" cy="-5" r="2.4" fill="#ffffff" opacity="0.85" />;
  const stroke = { fill: "none", stroke: eye, strokeWidth: 5.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "happy":
      return <path d="M-9.5 4 Q0 -10 9.5 4" {...stroke} />;
    case "love":
      return <path d={HEART_PATH} transform="scale(0.52)" fill={eye} />;
    case "star":
      return (
        <>
          <path d={SPARK_PATH} transform="scale(1.15)" fill={eye} />
          <circle r="2" fill="#ffffff" opacity="0.9" />
        </>
      );
    case "surprised":
      return (
        <>
          <circle r="11.5" fill={eye} />
          <circle cx="-3.5" cy="-4.5" r="3" fill="#ffffff" opacity="0.85" />
        </>
      );
    case "sleepy":
      return <path d="M-9 -1 Q0 6 9 -1" {...stroke} strokeWidth={5} />;
    case "focus":
      return <rect x="-10" y="-5.5" width="20" height="11" rx="5.5" fill={eye} />;
    case "code":
      return side === "l" ? <path d="M5 -9 L-5 0 L5 9" {...stroke} /> : <path d="M-5 -9 L5 0 L-5 9" {...stroke} />;
    case "determined":
      return side === "l" ? (
        <path d="M-10 -4 L10 1 Q10 12 0 12 Q-10 12 -10 -4 Z" fill={eye} />
      ) : (
        <path d="M-10 1 L10 -4 Q10 12 0 12 Q-10 12 -10 1 Z" fill={eye} />
      );
    case "curious":
      return side === "l" ? (
        <>
          <ellipse rx="10" ry="13" fill={eye} />
          {hl}
        </>
      ) : (
        <>
          <ellipse cy="-2" rx="7.5" ry="9.5" fill={eye} />
          <circle cx="-2" cy="-6" r="1.8" fill="#ffffff" opacity="0.85" />
        </>
      );
    case "confused":
      return side === "l" ? (
        <>
          <ellipse rx="9" ry="12" fill={eye} />
          {hl}
        </>
      ) : (
        <ellipse cy="-4" rx="8.5" ry="5" fill={eye} />
      );
    case "neutral":
    case "wink":
    default:
      return (
        <>
          <ellipse rx="9" ry="12" fill={eye} />
          {hl}
        </>
      );
  }
}

/* --------------------------------------------------------------- Emblem -- */

function ChestEmblem({ kind, eye, glow }: { kind: Emblem; eye: string; glow: string }) {
  const s = { fill: "none", stroke: eye, strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  let icon: ReactNode;
  switch (kind) {
    case "cross":
      icon = <path d="M0 -6.5 V6.5 M-6.5 0 H6.5" {...s} strokeWidth={3.6} />;
      break;
    case "atom":
      icon = (
        <g {...s} strokeWidth={1.6}>
          <ellipse rx="8" ry="3.2" />
          <ellipse rx="8" ry="3.2" transform="rotate(60)" />
          <ellipse rx="8" ry="3.2" transform="rotate(-60)" />
          <circle r="1.8" fill={eye} stroke="none" />
        </g>
      );
      break;
    case "bulb":
      icon = (
        <g {...s} strokeWidth={1.8}>
          <path d="M-3.2 3.5 C-3.2 1.5 -6 0 -6 -3 A6 6 0 1 1 6 -3 C6 0 3.2 1.5 3.2 3.5 Z" />
          <path d="M-2.6 6 H2.6 M-1.6 8 H1.6" />
        </g>
      );
      break;
    case "clock":
      icon = (
        <g {...s} strokeWidth={1.8}>
          <circle r="7" />
          <path className="aura-tick" d="M0 0 V-4.8" />
          <path d="M0 0 L3.4 2" />
        </g>
      );
      break;
    case "code":
      icon = <path d="M-3 -5 L-7 0 L-3 5 M3 -5 L7 0 L3 5" {...s} strokeWidth={2} />;
      break;
    case "star":
      icon = (
        <path
          d="M0 -7.5 L2.2 -2.6 L7.4 -2.2 L3.4 1.2 L4.6 6.4 L0 3.6 L-4.6 6.4 L-3.4 1.2 L-7.4 -2.2 L-2.2 -2.6 Z"
          fill={eye}
        />
      );
      break;
    case "gear":
      icon = (
        <g fill={eye}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <rect key={a} x="-1.6" y="-8" width="3.2" height="4" rx="1" transform={`rotate(${a})`} />
          ))}
          <circle r="5" />
          <circle r="2" fill="#0b1222" />
        </g>
      );
      break;
    case "heart":
      icon = <path d={HEART_PATH} transform="scale(0.34)" fill={eye} />;
      break;
    case "play":
      icon = <path d="M-3 -5.5 L6 0 L-3 5.5 Z" fill={eye} />;
      break;
    case "check":
      icon = <path d="M-5 0.5 L-1.5 4 L5.5 -4" {...s} strokeWidth={2.8} />;
      break;
    case "pin":
      icon = (
        <g>
          <path d="M0 7 C-3 3.5 -5.5 0.8 -5.5 -2 A5.5 5.5 0 1 1 5.5 -2 C5.5 0.8 3 3.5 0 7 Z" fill={eye} />
          <circle cy="-2" r="2" fill="#0b1222" />
        </g>
      );
      break;
    case "spark":
    default:
      icon = <path d={SPARK_PATH} transform="scale(0.72)" fill={eye} />;
  }
  return (
    <g transform={`translate(${CHEST.x} ${CHEST.y})`}>
      <circle r="16.5" fill="#dbe5f3" />
      <circle r="13.5" fill="#0b1222" />
      <circle r="13" fill={glow} className="aura-chest-glow" />
      <g className="aura-chest-icon">{icon}</g>
    </g>
  );
}

function Stethoscope({ silver }: { silver: string }) {
  const tube = { fill: "none", stroke: "#5b6b86", strokeWidth: 4, strokeLinecap: "round" as const };
  return (
    <g>
      <path d="M101 147 C92 170 102 194 124 202" {...tube} />
      <path d="M159 147 C168 170 158 194 136 202" {...tube} />
      <path d="M124 202 Q130 207 136 202" {...tube} />
      <path d="M130 205 C131 216 141 222 149 226" {...tube} />
      <circle cx="153" cy="229" r="8.5" fill={silver} stroke="#5b6b86" strokeWidth="2.5" />
      <circle cx="153" cy="229" r="3.6" fill="#e2e8f0" />
    </g>
  );
}

/* ------------------------------------------------------------- Headwear -- */

function HeadwearArt({ kind, eye, party }: { kind: Headwear; eye: string; party: string }) {
  switch (kind) {
    case "gradCap":
      return (
        <g transform="translate(130 51) rotate(-8)">
          <path d="M-20 3 L-20 14 Q0 22 20 14 L20 3 Z" fill="#1e2740" />
          <path d="M-40 -2 L0 -15 L40 -2 L0 11 Z" fill="#2b3550" />
          <path d="M-40 -2 L0 11 L40 -2" fill="none" stroke="#4a5677" strokeWidth="1.5" />
          <circle cy="-2" r="2.6" fill="#ffd166" />
          <path d="M0 -2 Q20 -5 27 1 L28 18" fill="none" stroke="#ffd166" strokeWidth="2.2" strokeLinecap="round" />
          <rect x="25" y="17" width="6.5" height="9" rx="2" fill="#ffd166" />
        </g>
      );
    case "hardHat":
      return (
        <g transform="translate(130 64)">
          <path d="M-44 2 C-44 -26 -22 -40 0 -40 C22 -40 44 -26 44 2 Z" fill="#ffcd3c" />
          <path d="M-7 -39.5 L-6 2 L6 2 L7 -39.5 Q0 -41 -7 -39.5 Z" fill="#ffe08a" />
          <path d="M-30 -22 C-24 -30 -16 -34 -10 -35" fill="none" stroke="#fff3c4" strokeWidth="3" strokeLinecap="round" />
          <rect x="-52" y="-1" width="104" height="9" rx="4.5" fill="#f4b400" />
        </g>
      );
    case "partyHat":
      return (
        <g transform="translate(152 58) rotate(16)">
          <path d="M0 -46 L19 0 L-19 0 Z" fill={party} />
          <path d="M-12 -16 L9 -24 M-16 -6 L14 -14" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="3" strokeLinecap="round" />
          <rect x="-21" y="-3" width="42" height="6" rx="3" fill="#ffffff" opacity="0.9" />
          <circle cy="-47" r="5.5" fill="#ffd166" />
        </g>
      );
    case "headset":
      return (
        <g>
          <path d="M63 104 C60 24 200 24 197 104" fill="none" stroke="#3b4763" strokeWidth="7" strokeLinecap="round" />
          <rect x="53" y="88" width="17" height="31" rx="8.5" fill="#2b3550" stroke={eye} strokeWidth="2" />
          <rect x="190" y="88" width="17" height="31" rx="8.5" fill="#2b3550" stroke={eye} strokeWidth="2" />
          <path d="M199 116 C203 134 188 141 168 139" fill="none" stroke="#2b3550" strokeWidth="4" strokeLinecap="round" />
          <circle cx="166" cy="139" r="4.5" fill={eye} />
        </g>
      );
    default:
      return null;
  }
}

/* ---------------------------------------------------------------- Props -- */

type Pt = { x: number; y: number };

function PropArt({
  kind,
  gripR,
  gripL,
  eye,
  line,
  url,
  waves,
}: {
  kind: PropKind;
  gripR: Pt;
  gripL: Pt;
  eye: string;
  line: string;
  url: (name: string) => string;
  waves: boolean;
}) {
  const at = (p: Pt, dx = 0, dy = 0, extra = "") => `translate(${(p.x + dx).toFixed(1)} ${(p.y + dy).toFixed(1)})${extra}`;
  const mid = { x: (gripL.x + gripR.x) / 2, y: (gripL.y + gripR.y) / 2 };
  switch (kind) {
    case "heartPulse":
      return (
        <g transform={at(gripR, -12, -4)}>
          <path d={HEART_PATH} fill={url("pink")} />
          <path d="M-14 -3 H-6 L-3 -9 L1 4 L4 -3 H13" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case "flask":
      return (
        <g transform={at(gripR, 0, 0)}>
          <path d="M-5 -6 L-5 14 L-17 34 Q-19 41 -12 41 L12 41 Q19 41 17 34 L5 14 L5 -6 Z" fill="#ffffff" fillOpacity="0.7" stroke={line} strokeWidth="2" strokeLinejoin="round" />
          <path d="M-11.6 25 L11.6 25 L17 34 Q19 41 12 41 L-12 41 Q-19 41 -17 34 Z" fill="#b9a3ff" />
          <rect x="-7.5" y="-10" width="15" height="5" rx="2.5" fill={line} />
          <g fill="#ffffff">
            <circle className="aura-bubble" cx="-4" cy="33" r="2.2" />
            <circle className="aura-bubble aura-bubble-2" cx="4" cy="30" r="1.6" />
            <circle className="aura-bubble aura-bubble-3" cx="0" cy="35" r="1.3" />
          </g>
        </g>
      );
    case "rocket":
      return (
        <g transform={at(gripR, 5, 26, " rotate(14)")}>
          <path className="aura-flame" d="M-6 -6 Q0 12 6 -6 Z" fill={url("flame")} />
          <rect x="-7" y="-12" width="14" height="6" rx="2" fill="#5b6b86" />
          <path d="M0 -58 C11 -49 13 -31 11 -12 L-11 -12 C-13 -31 -11 -49 0 -58 Z" fill="#ffffff" stroke={line} strokeWidth="1.8" />
          <path d="M0 -58 C6 -53 9 -47 10 -42 L-10 -42 C-9 -47 -6 -53 0 -58 Z" fill="#ff8fb8" />
          <circle cy="-30" r="5.5" fill={eye} stroke={line} strokeWidth="1.8" />
          <path d="M-11 -26 L-19 -9 L-11 -12 Z M11 -26 L19 -9 L11 -12 Z" fill="#ffab7a" />
        </g>
      );
    case "clipboard":
      return (
        <g transform={at(mid, 0, 6)}>
          <rect x="-28" y="-32" width="56" height="64" rx="7" fill="#7cc3ff" />
          <rect x="-22" y="-25" width="44" height="52" rx="4" fill="#ffffff" />
          <rect x="-11" y="-37" width="22" height="10" rx="3.5" fill="#5b6b86" />
          {[-14, -1, 12].map((y, i) => (
            <g key={y} transform={`translate(0 ${y})`}>
              <rect x="-17" y="-4" width="8" height="8" rx="2.5" fill={i < 2 ? "#5ef0b8" : "#e2e8f0"} />
              {i < 2 ? <path d="M-15.3 0 L-13.6 1.8 L-10.8 -1.8" fill="none" stroke="#0d7352" strokeWidth="1.6" strokeLinecap="round" /> : null}
              <rect x="-5" y="-2" width={i === 1 ? 16 : 22} height="4" rx="2" fill="#cbd5e1" />
            </g>
          ))}
        </g>
      );
    case "mic":
      return (
        <g transform={at(gripR, -3, 6, " rotate(-32)")}>
          <rect x="-4.2" y="-3" width="8.4" height="30" rx="4.2" fill="#3b4763" />
          <rect x="-5.2" y="-4" width="10.4" height="5" rx="2" fill={eye} />
          <circle cy="-13" r="10.5" fill={url("silver")} stroke="#5b6b86" strokeWidth="1.6" />
          <path d="M-7 -16 H7 M-8.5 -12 H8.5 M-7 -8 H7 M-3 -21 V-5 M3 -21 V-5" stroke="#7b8aa5" strokeWidth="1.1" strokeLinecap="round" />
          <circle cx="-4" cy="-17" r="2.4" fill="#ffffff" opacity="0.8" />
        </g>
      );
    case "book":
      return (
        <g transform={at(mid, 0, 4)}>
          <path d="M0 -6 C-10 -13 -24 -13 -33 -8 L-33 22 C-24 17 -10 17 0 24 C10 17 24 17 33 22 L33 -8 C24 -13 10 -13 0 -6 Z" fill="#5ef0b8" />
          <path d="M0 -3 C-9 -9 -21 -9 -29 -5 L-29 18 C-21 14 -9 14 0 20 Z" fill="#ffffff" />
          <path d="M0 -3 C9 -9 21 -9 29 -5 L29 18 C21 14 9 14 0 20 Z" fill="#f8fafc" />
          <path d="M-23 0 H-7 M-23 6 H-9 M-23 12 H-10 M7 0 H23 M9 6 H23 M10 12 H22" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "tablet":
      return (
        <g transform={at(mid, 0, 4)}>
          <rect x="-31" y="-23" width="62" height="46" rx="8" fill="#2b3550" />
          <rect x="-27" y="-19" width="54" height="38" rx="5" fill={url("screen")} />
          <circle r="10" fill="#ffffff" opacity="0.92" />
          <path d="M-3.5 -5.5 L6 0 L-3.5 5.5 Z" fill="#5b3cc4" />
        </g>
      );
    case "laptop":
      return (
        <g transform={at(mid, 0, 6)}>
          <rect x="-36" y="-32" width="72" height="44" rx="6" fill="#2b3550" />
          <rect x="-32" y="-28" width="64" height="36" rx="3.5" fill="#0b1222" />
          <path d="M-14 -16 L-21 -10 L-14 -4 M14 -16 L21 -10 L14 -4 M4 -19 L-4 -1" fill="none" stroke="#5ef0b8" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <rect className="aura-cursor" x="-12" y="2" width="9" height="2.6" rx="1" fill="#5ef0b8" />
          <path d="M-44 12 L44 12 L50 20 Q50 22 48 22 L-48 22 Q-50 22 -50 20 Z" fill="#cbd5e1" />
          <rect x="-8" y="13.5" width="16" height="3" rx="1.5" fill="#94a3b8" />
        </g>
      );
    case "trophy":
      return (
        <g transform={at(gripR, 0, -2)}>
          <rect x="-11" y="-6" width="22" height="7" rx="2.5" fill="#c98a12" />
          <rect x="-3.2" y="-13" width="6.4" height="8" fill="#e09a12" />
          <path d="M-15 -44 H15 L13 -26 C11 -17 5 -13 0 -13 C-5 -13 -11 -17 -13 -26 Z" fill={url("gold")} />
          <path d="M-15 -40 C-24 -40 -24 -27 -13 -27 M15 -40 C24 -40 24 -27 13 -27" fill="none" stroke="#e8a920" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M0 -37 L1.8 -33 L6 -32.6 L2.8 -29.8 L3.8 -25.6 L0 -27.9 L-3.8 -25.6 L-2.8 -29.8 L-6 -32.6 L-1.8 -33 Z" fill="#fff6d1" />
        </g>
      );
    case "ticket":
      return (
        <g transform={at(gripR, -16, -8, " rotate(-14)")}>
          <path d="M-27 -15 H27 V-5 A5 5 0 0 0 27 5 V15 H-27 V5 A5 5 0 0 0 -27 -5 Z" fill="#ffd166" />
          <path d="M11 -13 V13" stroke="#b07a00" strokeWidth="1.6" strokeDasharray="2.5 2.5" />
          <rect x="-20" y="-7" width="24" height="4" rx="2" fill="#b07a00" opacity="0.7" />
          <rect x="-20" y="1" width="16" height="4" rx="2" fill="#b07a00" opacity="0.45" />
          <path d="M19 -4.5 L20.4 -1.4 L23.8 -1.1 L21.2 1.1 L22 4.4 L19 2.6 L16 4.4 L16.8 1.1 L14.2 -1.1 L17.6 -1.4 Z" fill="#b07a00" />
        </g>
      );
    case "megaphone":
      return (
        <g transform={at(gripR, -2, -14)}>
          <rect x="1" y="6" width="6" height="13" rx="3" fill="#3b4763" />
          <path d="M-8 -6 L24 -19 L24 17 L-8 6 Z" fill="#ffab7a" />
          <rect x="-15" y="-6" width="9" height="12" rx="3" fill="#3b4763" />
          <ellipse cx="24" cy="-1" rx="4.5" ry="18" fill="#ffc9a8" />
          {waves ? (
            <g className="aura-waves" fill="none" stroke="#ffab7a" strokeWidth="3" strokeLinecap="round">
              <path d="M34 -10 Q40 -1 34 8" />
              <path className="aura-wave-2" d="M42 -16 Q51 -1 42 14" />
            </g>
          ) : null}
        </g>
      );
    case "mapPin":
      return (
        <g transform={at(gripR, 0, -8)}>
          <g className="aura-bob-small">
            <path d="M0 0 C-12 -14 -19 -23 -19 -33 A19 19 0 1 1 19 -33 C19 -23 12 -14 0 0 Z" fill={url("pink")} />
            <circle cy="-33" r="7.5" fill="#ffffff" />
          </g>
        </g>
      );
    case "suitcase":
      return (
        <g transform={at(gripR, 0, 2)}>
          <path d="M-7 6 V0 Q-7 -5 -2 -5 H2 Q7 -5 7 0 V6" fill="none" stroke="#3b4763" strokeWidth="3" />
          <rect x="-21" y="5" width="42" height="31" rx="6" fill="#ffab7a" />
          <rect x="-12" y="5" width="4" height="31" fill="#e07c45" />
          <rect x="8" y="5" width="4" height="31" fill="#e07c45" />
        </g>
      );
    case "magnifier":
      return (
        <g>
          <path d={`M${EYE_R.x + 11} ${EYE_R.y + 11} L${gripR.x + 3} ${gripR.y + 3}`} stroke="#3b4763" strokeWidth="6" strokeLinecap="round" />
          <circle cx={EYE_R.x} cy={EYE_R.y} r="16" fill={eye} fillOpacity="0.14" stroke="#5b6b86" strokeWidth="4" />
          <path d={`M${EYE_R.x - 9} ${EYE_R.y - 7} Q${EYE_R.x - 6} ${EYE_R.y - 11} ${EYE_R.x - 1} ${EYE_R.y - 12}`} fill="none" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "paperPlane":
      return (
        <g transform={at(gripR, 2, -14)}>
          <g className="aura-bob-small">
            <path d="M-20 -1 L24 -18 L3 7 Z" fill="#ffffff" stroke={line} strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M3 7 L24 -18 L8 15 Z" fill="#dbe4f0" stroke={line} strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M-26 8 H-36 M-22 15 H-30" stroke={eye} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="3 4" />
          </g>
        </g>
      );
    case "wrench":
      return (
        <g transform={at(gripR, 0, 2, " rotate(16)")}>
          <rect x="-3.8" y="-34" width="7.6" height="36" rx="3.8" fill="#94a3b8" />
          <path d="M-4.5 -49 L-4.5 -40 L4.5 -40 L4.5 -49 A11 11 0 1 1 -4.5 -49 Z" fill="#94a3b8" />
          <path d="M-1.2 -30 V-4" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "camera":
      return (
        <g transform={at(mid, 0, 2)}>
          <rect x="-11" y="-23" width="22" height="9" rx="3" fill="#3b4763" />
          <rect x="-28" y="-17" width="56" height="36" rx="8" fill="#3b4763" />
          <circle cy="1" r="12.5" fill="#0b1222" stroke="#94a3b8" strokeWidth="3" />
          <circle cy="1" r="6" fill={eye} opacity="0.85" />
          <circle cx="-3" cy="-2" r="2.2" fill="#ffffff" opacity="0.8" />
          <rect x="15" y="-13" width="8" height="5" rx="1.5" fill="#ffd166" />
        </g>
      );
    case "clapper":
      return (
        <g transform={at(gripR, 0, -4)}>
          <rect x="-19" y="-28" width="38" height="26" rx="3.5" fill="#2b3550" />
          <g transform="translate(-19 -30) rotate(-12)">
            <rect width="38" height="8" rx="2" fill="#2b3550" />
            <path d="M5 0 L10 8 M15 0 L20 8 M25 0 L30 8" stroke="#ffffff" strokeWidth="3" />
          </g>
          <path d="M-5 -21 L6 -15 L-5 -9 Z" fill={eye} />
        </g>
      );
    case "bigHeart":
      return (
        <g transform={at(mid, 0, 2, " scale(1.35)")}>
          <path d={HEART_PATH} fill={url("pink")} />
          <path d="M-12 -10 C-10 -14 -6 -15 -3 -14" fill="none" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      );
    case "stopwatch":
      return (
        <g transform={at(gripR, -13, -6)}>
          <rect x="-3.5" y="-24" width="7" height="6" rx="2" fill="#5b6b86" />
          <rect x="-6" y="-27" width="12" height="4" rx="2" fill="#5b6b86" />
          <circle r="17" fill="#ffffff" stroke="#5b6b86" strokeWidth="3.2" />
          {[0, 90, 180, 270].map((a) => (
            <rect key={a} x="-1" y="-13.5" width="2" height="3.5" rx="1" fill="#94a3b8" transform={`rotate(${a})`} />
          ))}
          <path className="aura-tick" d="M0 0 V-11" stroke="#ff6f9c" strokeWidth="2.4" strokeLinecap="round" />
          <circle r="2.4" fill="#3b4763" />
        </g>
      );
    case "signboard":
      return (
        <g transform={at(gripR, 0, 0)}>
          <rect x="-2.2" y="-30" width="4.4" height="32" rx="2.2" fill="#5b6b86" />
          <rect x="-28" y="-66" width="56" height="38" rx="7" fill="#ffffff" stroke={line} strokeWidth="1.8" />
          <path d="M-28 -59 Q-28 -66 -21 -66 H21 Q28 -66 28 -59 V-56 H-28 Z" fill="#ffab7a" />
          {[-21, -7, 7, 21].map((x) => (
            <path key={x} d={`M${x - 7} -56 Q${x} -49 ${x + 7} -56`} fill="#ffab7a" />
          ))}
          <rect x="-17" y="-46" width="12" height="13" rx="2" fill="#7cc3ff" />
          <rect x="1" y="-46" width="16" height="4" rx="2" fill="#cbd5e1" />
          <rect x="1" y="-38" width="11" height="4" rx="2" fill="#cbd5e1" />
        </g>
      );
    default:
      return null;
  }
}

/* -------------------------------------------------------------- Placard -- */

/** Advance widths of Outfit Bold (the display font), in hundredths of an em, for " " (32) to "~" (126). */
const OUTFIT_BOLD = [
  19, 29, 46, 66, 60, 68, 69, 25, 31, 31, 49, 56, 28, 46, 30, 38,
  67, 38, 56, 56, 61, 56, 57, 53, 56, 57, 29, 28, 56, 56, 56, 50,
  76, 73, 64, 69, 75, 61, 59, 78, 73, 29, 53, 70, 56, 86, 74, 81,
  63, 82, 65, 58, 64, 70, 71, 100, 71, 69, 61, 35, 38, 35, 47, 50,
  32, 59, 59, 50, 59, 55, 44, 58, 57, 26, 27, 55, 26, 87, 57, 58,
  59, 59, 44, 46, 40, 54, 54, 78, 54, 53, 48, 34, 30, 34, 56,
];

/** Width of a line of text, in em. */
function textWidth(text: string) {
  let w = 0;
  for (const ch of text) {
    const i = ch.charCodeAt(0) - 32;
    w += (i >= 0 && i < OUTFIT_BOLD.length ? OUTFIT_BOLD[i] : 60) / 100;
  }
  return w;
}

/* The board: its size, where its centre sits from the hand, and the room for text inside the frame. */
const BOARD = { w: 132, h: 68, x: -24, y: -112 };
const BOARD_TEXT = { w: 108, h: 48, max: 16, leading: 1.14 };

/** The text in one to three lines, at the largest size that fits the board (fewer, then more even, lines win ties). */
export function fitPlacard(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const join = (from: number, to?: number) => words.slice(from, to).join(" ");
  let best = { lines: [join(0)], size: 0, widest: Infinity };
  const consider = (lines: string[]) => {
    const widest = Math.max(...lines.map(textWidth));
    const size = Math.min(BOARD_TEXT.max, BOARD_TEXT.w / widest, BOARD_TEXT.h / (lines.length * BOARD_TEXT.leading));
    if (size > best.size + 0.05 || (size > best.size - 0.05 && lines.length === best.lines.length && widest < best.widest)) best = { lines, size, widest };
  };
  consider([join(0)]);
  for (let i = 1; i < words.length; i++) consider([join(0, i), join(i)]);
  for (let i = 1; i < words.length; i++) for (let j = i + 1; j < words.length; j++) consider([join(0, i), join(i, j), join(j)]);
  return best;
}

/**
 * A placard on a stick, held up in the right hand above and beside the head, rocking gently. Each line is
 * drawn at its measured width (textLength), so it fits the board whichever font has loaded.
 */
function Placard({ text, grip, line, url }: { text: string; grip: Pt; line: string; url: (name: string) => string }) {
  const { lines, size } = fitPlacard(text);
  const lead = size * BOARD_TEXT.leading;
  const { w, h } = BOARD;
  return (
    <g transform={`translate(${grip.x.toFixed(1)} ${grip.y.toFixed(1)})`}>
      <g className="aura-placard">
        <rect x="-2.6" y={BOARD.y} width="5.2" height={-BOARD.y + 6} rx="2.6" fill="#5b6b86" />
        <g transform={`translate(${BOARD.x} ${BOARD.y})`}>
          <rect x={-w / 2 + 2} y={-h / 2 + 4} width={w} height={h} rx="10" fill="#0f172a" opacity="0.14" />
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="10" fill={url("screen")} stroke={line} strokeOpacity="0.4" strokeWidth="1" />
          <rect x={-w / 2 + 4} y={-h / 2 + 4} width={w - 8} height={h - 8} rx="7" fill="#ffffff" />
          <g fill="#1d2946" fontWeight="700" textAnchor="middle" style={{ fontFamily: "var(--font-display, sans-serif)" }}>
            {lines.map((l, i) => (
              <text
                key={i}
                x="0"
                y={((i - (lines.length - 1) / 2) * lead + size * 0.35).toFixed(2)}
                fontSize={size.toFixed(2)}
                textLength={(textWidth(l) * size).toFixed(1)}
                lengthAdjust="spacingAndGlyphs"
              >
                {l}
              </text>
            ))}
          </g>
        </g>
      </g>
    </g>
  );
}

/* -------------------------------------------------------------- Effects -- */

function Orbit({ clip, eye }: { clip: string; eye: string }) {
  const nodes = [
    { a: 0, c: "#b9a3ff" },
    { a: 120, c: "#5ef0b8" },
    { a: 240, c: "#ffab7a" },
  ];
  return (
    <g clipPath={clip}>
      <ellipse cx="130" cy="190" rx="122" ry="36" fill="none" stroke={eye} strokeOpacity="0.45" strokeWidth="1.5" strokeDasharray="4 6" />
      <g transform="translate(130 190) scale(1 0.3)">
        <g className="aura-orbit-spin">
          <circle r="132" fill="none" />
          {nodes.map((n) => {
            const t = (n.a * Math.PI) / 180;
            return (
              <g key={n.a} transform={`translate(${(122 * Math.cos(t)).toFixed(2)} ${(122 * Math.sin(t)).toFixed(2)})`}>
                <g className="aura-orbit-node">
                  <ellipse rx="7" ry="23.3" fill={n.c} />
                  <ellipse rx="3" ry="10" fill="#ffffff" opacity="0.8" />
                </g>
              </g>
            );
          })}
        </g>
      </g>
    </g>
  );
}

/** `clearTopRight` leaves out the sparkle a placard would cover. */
function Sparkles({ eye, clearTopRight = false }: { eye: string; clearTopRight?: boolean }) {
  const pts = [
    { x: 34, y: 62, s: 0.62, c: eye },
    { x: 226, y: 50, s: 0.8, c: "#ffd166" },
    { x: 238, y: 200, s: 0.55, c: "#b9a3ff" },
    { x: 22, y: 216, s: 0.7, c: "#ff8fb8" },
  ];
  return (
    <g>
      {pts.map((p, i) =>
        clearTopRight && i === 1 ? null : (
          <g key={i} transform={`translate(${p.x} ${p.y}) scale(${p.s})`}>
            <path className={`aura-twinkle aura-delay-${i}`} d={SPARK_PATH} fill={p.c} />
          </g>
        ),
      )}
    </g>
  );
}

function FloatingHearts() {
  const pts = [
    { x: 36, y: 86, s: 0.38 },
    { x: 222, y: 72, s: 0.5 },
    { x: 232, y: 160, s: 0.32 },
  ];
  return (
    <g>
      {pts.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y}) scale(${p.s})`}>
          <path className={`aura-rise aura-delay-${i}`} d={HEART_PATH} fill="#ff8fb8" />
        </g>
      ))}
    </g>
  );
}

function FloatingCode({ eye }: { eye: string }) {
  const s = { fill: "none", stroke: eye, strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <g>
      <g transform="translate(30 70)">
        <path className="aura-rise aura-delay-0" d="M-4 -7 L-10 0 L-4 7 M4 -7 L10 0 L4 7" {...s} />
      </g>
      <g transform="translate(228 58)">
        <path className="aura-rise aura-delay-1" d="M-3 -8 C-7 -8 -6 -2 -9 0 C-6 2 -7 8 -3 8 M3 -8 C7 -8 6 -2 9 0 C6 2 7 8 3 8" {...s} />
      </g>
      <g transform="translate(234 150)">
        <path className="aura-rise aura-delay-2" d="M-6 6 L6 -6 M-8 -2 L-4 -6 M8 2 L4 6" {...s} strokeWidth={2.6} />
      </g>
    </g>
  );
}

function Zzz({ eye }: { eye: string }) {
  const z = (x: number, y: number, s: number, i: number) => (
    <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
      <path className={`aura-rise aura-delay-${i}`} d="M-5 -5 H5 L-5 5 H5" fill="none" stroke={eye} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
  return <g>{[z(182, 52, 1, 0), z(198, 34, 1.3, 1), z(216, 14, 1.6, 2)]}</g>;
}

function QuestionBubble({ eye, line }: { eye: string; line: string }) {
  return (
    <g className="aura-bob-small">
      <circle cx="196" cy="70" r="3" fill="#ffffff" stroke={line} strokeWidth="1.5" />
      <circle cx="206" cy="58" r="4.5" fill="#ffffff" stroke={line} strokeWidth="1.5" />
      <circle cx="222" cy="36" r="17" fill="#ffffff" stroke={line} strokeWidth="1.8" />
      <path d="M216.5 30 C216.5 24 227.5 24 227.5 30 C227.5 34.5 222 35 222 40" fill="none" stroke={eye === "#5fe3ff" ? "#5b3cc4" : eye} strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="222" cy="46" r="2.2" fill={eye === "#5fe3ff" ? "#5b3cc4" : eye} />
    </g>
  );
}

function IdeaBulb({ gold }: { gold: string }) {
  return (
    <g transform="translate(130 22)">
      <circle className="aura-glow-pulse" r="22" fill="#ffd166" opacity="0.3" />
      <g className="aura-rays" stroke="#ffc53d" strokeWidth="2.6" strokeLinecap="round">
        {[-60, -30, 0, 30, 60].map((a) => (
          <path key={a} d="M0 -19 V-24" transform={`rotate(${a})`} />
        ))}
      </g>
      <path d="M-5 9 C-5 5 -11 2 -11 -4 A11 11 0 1 1 11 -4 C11 2 5 5 5 9 Z" fill={gold} />
      <rect x="-5.5" y="9" width="11" height="4" rx="1.5" fill="#8a9ab5" />
      <rect x="-4" y="13.5" width="8" height="3" rx="1.5" fill="#8a9ab5" />
    </g>
  );
}

function Confetti() {
  const colors = ["#ff8fb8", "#ffd166", "#5ef0b8", "#7cc3ff", "#b9a3ff", "#ffab7a"];
  const bits = [
    [24, 30, 20], [52, 12, -30], [80, 34, 45], [184, 18, 15], [212, 40, -20], [238, 22, 60],
    [16, 96, -45], [244, 104, 30], [40, 150, 10], [226, 152, -60], [104, 8, 70], [160, 30, -10],
  ];
  return (
    <g>
      {bits.map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          {i % 3 === 0 ? (
            <circle className={`aura-confetti aura-delay-${i % 4}`} r="3" fill={colors[i % colors.length]} />
          ) : (
            <rect className={`aura-confetti aura-delay-${i % 4}`} x="-4" y="-2" width="8" height="4" rx="1" fill={colors[i % colors.length]} />
          )}
        </g>
      ))}
    </g>
  );
}
