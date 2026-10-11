"use client";

import "./aura.css";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { AuraArt, AURA_H, AURA_W } from "./AuraArt";
import { AURA_PRESETS } from "./presets";
import { onIdleChange, trackLook } from "./look";
import type { AuraLook, AuraVariant, Effect, Expression, Pose } from "./types";

export interface AuraProps {
  /** Which representation of Aura to show (see presets.ts). */
  variant?: AuraVariant;
  /** Rendered width in px. */
  size?: number;
  /** Click / keyboard reactions with speech-bubble tips, eyes follow the pointer. */
  interactive?: boolean;
  /** Eyes follow the pointer (defaults to `interactive`). */
  track?: boolean;
  /** Show a greeting bubble shortly after mount (true = first tip). */
  greet?: boolean | string;
  /** Override the preset tips. */
  tips?: string[];
  bubbleSide?: "left" | "right";
  /** Accessible label. Non-interactive Auras are decorative unless a label is given. */
  label?: string;
  /** Fewer ambient effects (used for small instances). */
  lite?: boolean;
  /** Fixed gaze direction, -1..1 on each axis. */
  look?: { x: number; y: number };
  /** Fall asleep after the visitor has been idle (default: interactive). */
  sleepWhenIdle?: boolean;
  /** Fine-tune the preset (expression, prop, effects…). */
  overrides?: Partial<AuraLook>;
  onActivate?: () => void;
  className?: string;
}

export function Aura({
  variant = "hero",
  size = 200,
  interactive = false,
  track,
  greet = false,
  tips,
  bubbleSide = "right",
  label,
  lite,
  look,
  sleepWhenIdle,
  overrides,
  onActivate,
  className,
}: AuraProps) {
  const preset = AURA_PRESETS[variant];
  const base: AuraLook = { ...preset, ...overrides };
  const lines = tips ?? preset.tips;
  const rawId = useId();
  const uid = `aura${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const ref = useRef<HTMLElement | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const tipIndex = useRef(0);
  const lastReaction = useRef<"twirl" | "hop">("hop");

  const [tempExpression, setTempExpression] = useState<Expression | null>(null);
  const [poseOverride, setPoseOverride] = useState<Pose | null>(null);
  const [reaction, setReaction] = useState<"twirl" | "hop" | null>(null);
  const [bubble, setBubble] = useState<string | null>(null);
  const [idle, setIdle] = useState(false);

  // Reset temporary state when the variant changes (e.g. FAQ "answer" mode).
  const [prevVariant, setPrevVariant] = useState(variant);
  if (prevVariant !== variant) {
    setPrevVariant(variant);
    setTempExpression(null);
    setPoseOverride(null);
  }

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const waves = base.pose === "wave" || base.pose === "cheer";

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  // Wave hello, then relax.
  useEffect(() => {
    if (!waves) return;
    const t = setTimeout(() => setPoseOverride("idle"), 4500);
    return () => clearTimeout(t);
  }, [waves, variant]);

  // Greeting bubble.
  useEffect(() => {
    if (!greet) return;
    const text = typeof greet === "string" ? greet : lines[0];
    if (!text) return;
    tipIndex.current = typeof greet === "string" ? 0 : 1;
    const show = setTimeout(() => setBubble(text), 900);
    const hide = setTimeout(() => setBubble(null), 6400);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [greet]);

  // Eyes follow the pointer.
  const shouldTrack = track ?? interactive;
  useEffect(() => {
    if (!shouldTrack || !ref.current) return;
    return trackLook(ref.current);
  }, [shouldTrack]);

  // Doze off when the visitor is idle.
  const shouldSleep = sleepWhenIdle ?? interactive;
  useEffect(() => {
    if (!shouldSleep) return;
    return onIdleChange(setIdle);
  }, [shouldSleep]);

  function activate() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setIdle(false);
    const next = lastReaction.current === "twirl" ? "hop" : "twirl";
    lastReaction.current = next;
    setReaction(null);
    requestAnimationFrame(() => setReaction(next));
    later(() => setReaction(null), 950);
    setTempExpression(base.expression === "happy" ? "star" : "happy");
    later(() => setTempExpression(null), 1700);
    if (waves) {
      setPoseOverride(null);
      later(() => setPoseOverride("idle"), 3600);
    }
    if (lines.length) {
      setBubble(lines[tipIndex.current % lines.length]);
      tipIndex.current += 1;
      later(() => setBubble(null), 5600);
    }
    onActivate?.();
  }

  const expression: Expression = idle ? "sleepy" : (tempExpression ?? base.expression);
  const pose: Pose = idle ? "idle" : (poseOverride ?? base.pose);
  const effects: Effect[] = idle
    ? [...(base.effects ?? []).filter((e) => e !== "confetti"), "zzz"]
    : (base.effects ?? []);

  const style = {
    width: size,
    ...(look ? { "--lx": look.x, "--ly": look.y } : null),
  } as CSSProperties;

  const art = (
    <AuraArt
      uid={uid}
      {...base}
      expression={expression}
      pose={pose}
      effects={effects}
      className="aura-svg h-auto w-full"
      width={size}
      height={Math.round((size * AURA_H) / AURA_W)}
    />
  );

  const bubbleEl = bubble ? (
    <span
      aria-hidden="true"
      className={cn(
        "aura-bubble-say pointer-events-none absolute bottom-[80%] z-20 w-max max-w-[min(15rem,72vw)] rounded-2xl border border-border bg-surface px-3.5 py-2 text-left font-sans text-[13px] leading-snug font-medium text-fg shadow-card-lg",
        bubbleSide === "right" ? "left-[56%]" : "right-[56%]",
        size >= 200 && "max-sm:inset-x-[6%] max-sm:w-auto max-sm:max-w-none",
      )}
      style={{ "--bubble-origin": bubbleSide === "right" ? "0% 100%" : "100% 100%" } as CSSProperties}
    >
      {bubble}
      <span
        className={cn(
          "absolute -bottom-[7px] h-3 w-3 rotate-45 border-r border-b border-border bg-surface",
          bubbleSide === "right" ? "left-5" : "right-5",
        )}
      />
    </span>
  ) : null;

  const live = (
    <span className="sr-only" aria-live="polite">
      {bubble ?? ""}
    </span>
  );

  const classes = cn(
    "aura-wrap relative inline-block shrink-0 select-none align-middle",
    reaction && `aura--${reaction}`,
    (lite ?? size < 110) && "aura--lite",
    className,
  );

  if (interactive) {
    // The bubble and live region sit beside the button (not inside it), so the
    // button's accessible name matches what it shows.
    return (
      <span
        ref={(el) => {
          ref.current = el;
        }}
        className={classes}
        style={style}
      >
        <button
          type="button"
          onClick={activate}
          className="block w-full cursor-pointer rounded-[42%] bg-transparent p-0 [touch-action:manipulation]"
          aria-label={`${label ?? preset.label}. Press for a tip.`}
        >
          {art}
        </button>
        {bubbleEl}
        {live}
      </span>
    );
  }

  return (
    <div
      ref={(el) => {
        ref.current = el;
      }}
      className={classes}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {art}
      {bubbleEl}
    </div>
  );
}
