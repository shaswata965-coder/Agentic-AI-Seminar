"use client";

import { Brain, Eye, RefreshCw, Route, Zap, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Aura } from "@/components/aura/Aura";
import { cn } from "@/lib/cn";

const STEPS: { title: string; text: string; Icon: LucideIcon; tone: string }[] = [
  { title: "Perceive", text: "Takes in the goal and its surroundings — user requests, documents, sensor data and tool outputs.", Icon: Eye, tone: "tone-azure" },
  { title: "Reason", text: "Makes sense of the situation and decides what matters, often with a large language model as its engine.", Icon: Brain, tone: "tone-lilac" },
  { title: "Plan", text: "Breaks the goal into steps and chooses which tools, data or other agents to use.", Icon: Route, tone: "tone-mint" },
  { title: "Act", text: "Executes the plan — calls APIs, runs code, searches, writes — or asks a human when it should.", Icon: Zap, tone: "tone-peach" },
  { title: "Reflect", text: "Checks the outcome, learns from feedback and adapts the plan for the next loop.", Icon: RefreshCw, tone: "tone-blush" },
];

/** Interactive perceive → reason → plan → act → reflect loop with Aura at the centre. */
export function AgentLoop() {
  const [active, setActive] = useState(0);
  const [turns, setTurns] = useState(0);
  const [auto, setAuto] = useState(true);
  const paused = useRef(false);

  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      if (paused.current) return;
      setActive((a) => {
        if (a === STEPS.length - 1) setTurns((n) => n + 1);
        return (a + 1) % STEPS.length;
      });
    }, 3200);
    return () => clearInterval(t);
  }, [auto]);

  const pick = (i: number) => {
    setAuto(false);
    if (i < active) setTurns((n) => n + 1);
    setActive(i);
  };

  const angle = turns * 360 + active * 72;
  const step = STEPS[active];

  return (
    <div
      className="relative mx-auto w-full max-w-[460px]"
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
    >
      <div className="relative aspect-square">
        <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden>
          <circle cx="200" cy="200" r="150" fill="none" stroke="var(--border-strong)" strokeWidth="2" strokeDasharray="3 9" strokeLinecap="round" />
          <circle cx="200" cy="200" r="150" fill="none" stroke="url(#loopGrad)" strokeWidth="3" strokeDasharray="60 882" strokeLinecap="round"
            style={{ transform: `rotate(${angle - 102}deg)`, transformOrigin: "200px 200px", transformBox: "view-box", transition: "transform 0.9s cubic-bezier(0.5,0,0.2,1)" }} />
          <defs>
            <linearGradient id="loopGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--lilac)" />
              <stop offset="100%" stopColor="var(--aqua)" />
            </linearGradient>
          </defs>
          <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: "200px 200px", transformBox: "view-box", transition: "transform 0.9s cubic-bezier(0.5,0,0.2,1)" }}>
            <circle cx="200" cy="50" r="7" fill="var(--aqua)" />
            <circle cx="200" cy="50" r="13" fill="var(--aqua)" opacity="0.25" />
          </g>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <Aura variant="thinker" size={150} overrides={{ effects: [] }} />
        </div>
        {STEPS.map((s, i) => {
          const a = ((i * 72 - 90) * Math.PI) / 180;
          const x = 50 + 37.5 * Math.cos(a);
          const y = 50 + 37.5 * Math.sin(a);
          const on = i === active;
          return (
            <button
              key={s.title}
              type="button"
              onClick={() => pick(i)}
              aria-pressed={on}
              aria-label={`${i + 1}. ${s.title}`}
              className={cn(
                s.tone,
                "absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 rounded-2xl px-2 py-1.5 transition-transform duration-300",
                on ? "scale-110" : "hover:scale-105",
              )}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span
                className={cn(
                  "grid h-14 w-14 place-items-center rounded-2xl shadow-card ring-1 transition-colors duration-300 sm:h-16 sm:w-16",
                  on ? "bg-[var(--accent)] text-[#0f172a] ring-transparent" : "bg-surface text-accent-ink ring-border",
                )}
              >
                <s.Icon size={24} aria-hidden />
              </span>
              <span className={cn("rounded-full px-2 text-sm font-bold", on ? "bg-accent-soft text-accent-ink" : "text-muted")}>{s.title}</span>
            </button>
          );
        })}
      </div>
      <div className={cn(step.tone, "card -mt-2 p-5 text-center")} aria-live="polite">
        <p className="text-xs font-bold tracking-[0.14em] text-accent-ink uppercase">
          Step {active + 1} of 5 · {step.title}
        </p>
        <p className="mt-2 text-[15px] text-muted">{step.text}</p>
      </div>
    </div>
  );
}
