"use client";

import { Shuffle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Aura } from "./Aura";
import { AURA_EYES } from "./presets";
import type { Effect, Emblem, Expression, Headwear, Pose, PropKind } from "./types";

const EXPRESSIONS: Expression[] = ["neutral", "happy", "love", "star", "surprised", "wink", "focus", "code", "determined", "curious", "confused", "sleepy"];
const POSES: Pose[] = ["idle", "wave", "hold", "holdBoth", "holdSide", "raise", "toFace", "point", "think", "cheer", "type", "lecture"];
const PROPS: (PropKind | "none")[] = ["none", "heartPulse", "flask", "rocket", "clipboard", "mic", "book", "tablet", "laptop", "trophy", "ticket", "megaphone", "mapPin", "suitcase", "magnifier", "paperPlane", "wrench", "camera", "clapper", "bigHeart", "stopwatch", "signboard", "poster"];
const POSE_FOR_PROP: Partial<Record<PropKind, Pose>> = {
  heartPulse: "hold", flask: "holdSide", rocket: "raise", clipboard: "holdBoth", mic: "toFace", book: "holdBoth", tablet: "holdBoth", laptop: "type", trophy: "raise", ticket: "hold",
  megaphone: "toFace", mapPin: "raise", suitcase: "holdSide", magnifier: "toFace", paperPlane: "raise", wrench: "raise", camera: "holdBoth", clapper: "raise", bigHeart: "holdBoth", stopwatch: "hold", signboard: "raise",
};
const HEADWEAR: (Headwear | "none")[] = ["none", "gradCap", "hardHat", "partyHat", "headset"];
const EMBLEMS: Emblem[] = ["spark", "cross", "atom", "bulb", "clock", "code", "star", "gear", "heart", "play", "check", "pin"];
const EFFECTS: Effect[] = ["orbit", "sparkles", "hearts", "code", "bulb", "question", "confetti", "zzz", "spotlight", "pulse", "scan", "flash"];

const label = (s: string) => s.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

function Group<T extends string>({ title, items, value, onChange }: { title: string; items: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="text-xs font-bold tracking-[0.12em] text-subtle uppercase">{title}</legend>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((it) => (
          <button
            key={it}
            type="button"
            aria-pressed={value === it}
            onClick={() => onChange(it)}
            data-ripple=""
            className={cn("rounded-md px-3 py-1.5 text-sm font-semibold transition hover:-translate-y-0.5", value === it ? "bg-brand text-brand-fg" : "bg-surface-2 text-muted hover:text-fg")}
          >
            {label(it)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Mix and match Aura's expressions, poses, props and effects. */
export function AuraPlayground() {
  const [expression, setExpression] = useState<Expression>("happy");
  const [pose, setPose] = useState<Pose>("wave");
  const [prop, setProp] = useState<PropKind | "none">("none");
  const [headwear, setHeadwear] = useState<Headwear | "none">("none");
  const [emblem, setEmblem] = useState<Emblem>("spark");
  const [effects, setEffects] = useState<Effect[]>(["sparkles"]);
  const [eye, setEye] = useState<string>(AURA_EYES.aqua);

  const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];
  function surprise() {
    const p = pick(PROPS);
    setProp(p);
    setPose(p !== "none" ? (POSE_FOR_PROP[p] ?? "idle") : pick(["idle", "wave", "point", "think", "cheer"] as Pose[]));
    setExpression(pick(EXPRESSIONS.filter((e) => e !== "sleepy")));
    setHeadwear(Math.random() > 0.6 ? pick(HEADWEAR) : "none");
    setEmblem(pick(EMBLEMS));
    setEffects([pick(EFFECTS)]);
    setEye(pick(Object.values(AURA_EYES)));
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <div className="card sticky top-24 flex min-w-0 flex-col items-center p-4 sm:p-6">
        <div className="relative grid min-h-[380px] w-full grid-cols-1 place-items-center rounded-3xl bg-[radial-gradient(circle_at_50%_40%,var(--azure-soft),transparent_70%)]">
          <Aura
            variant="hero"
            size={300}
            className="max-w-full"
            interactive
            tips={["Nice combo!", "I love this look.", "Try the surprise button!"]}
            overrides={{ expression, pose, prop: prop === "none" ? undefined : prop, headwear: headwear === "none" ? undefined : headwear, emblem, effects, eyeColor: eye }}
          />
        </div>
        <button type="button" onClick={surprise} data-ripple="" className="btn-shine key key-brand group mt-4 inline-flex items-center gap-2 rounded-[0.85rem] bg-brand px-5 py-2.5 font-semibold text-brand-fg hover:bg-brand-strong">
          <Shuffle size={17} aria-hidden className="transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-180" /> Surprise me
        </button>
      </div>
      <div className="card grid min-w-0 gap-6 p-4 sm:p-6">
        <Group title="Expression" items={EXPRESSIONS} value={expression} onChange={setExpression} />
        <Group title="Pose" items={POSES} value={pose} onChange={setPose} />
        <Group
          title="Holding"
          items={PROPS}
          value={prop}
          onChange={(p) => {
            setProp(p);
            if (p !== "none" && POSE_FOR_PROP[p]) setPose(POSE_FOR_PROP[p]!);
          }}
        />
        <Group title="Headwear" items={HEADWEAR} value={headwear} onChange={setHeadwear} />
        <Group title="Chest emblem" items={EMBLEMS} value={emblem} onChange={setEmblem} />
        <fieldset>
          <legend className="text-xs font-bold tracking-[0.12em] text-subtle uppercase">Effects</legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {EFFECTS.map((fx) => {
              const on = effects.includes(fx);
              return (
                <button key={fx} type="button" aria-pressed={on} onClick={() => setEffects((list) => (on ? list.filter((x) => x !== fx) : [...list, fx]))} data-ripple="" className={cn("rounded-md px-3 py-1.5 text-sm font-semibold transition hover:-translate-y-0.5", on ? "bg-brand text-brand-fg" : "bg-surface-2 text-muted hover:text-fg")}>
                  {label(fx)}
                </button>
              );
            })}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-xs font-bold tracking-[0.12em] text-subtle uppercase">Eye colour</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(AURA_EYES).map(([name, c]) => (
              <button key={name} type="button" aria-pressed={eye === c} aria-label={`${name} eyes`} onClick={() => setEye(c)} className={cn("h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-surface transition hover:scale-110", eye === c ? "scale-110 ring-brand" : "ring-transparent")} style={{ background: c }} />
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
