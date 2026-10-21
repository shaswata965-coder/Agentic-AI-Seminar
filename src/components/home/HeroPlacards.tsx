"use client";

import { Ticket, Trophy } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Aura } from "@/components/aura/Aura";
import { SlidingPill, useSlidingPill } from "@/components/ui/SlidingPill";
import { cn } from "@/lib/cn";
import type { RegistrationStatus, Tone } from "@/lib/content/constants";
import { deadlinePassed } from "@/lib/event";
import { useNow } from "./Countdown";

export type PlacardKey = "workshop" | "hackathon";

export interface HeroPlacard {
  key: PlacardKey;
  /** The words on the board, {status} not yet filled in. */
  text: string;
  /** Its name on the switch under Aura. */
  tab: string;
  tone: Tone;
  status: RegistrationStatus;
  deadline: string;
}

const ICONS = { workshop: Ticket, hackathon: Trophy } as const;

/**
 * The hero's Aura, holding up the workshop's and the hackathon's registration placards in turn. A placard
 * stays up while the bar on its switch fills (CSS, so it pauses with the page's other animations, and while
 * the pointer or focus is on Aura, the switch or a registration card); pointing at a registration card below
 * (`data-placard-key`) brings its placard up. With reduced motion the bar never runs, so only the switch and
 * the cards change it. The hero section is marked `data-placard="<key>"` so the matching card lights up.
 */
export function HeroPlacards({ placards, words }: { placards: HeroPlacard[]; words: Record<RegistrationStatus, string> }) {
  const now = useNow();
  const [index, setIndex] = useState(0);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const shown = placards.length ? placards[index % placards.length] : null;
  const { listRef, pillRef } = useSlidingPill(shown?.key, '[aria-pressed="true"]');

  // Registration that is open closes on its placard too once the deadline passes.
  const status = shown && shown.status === "open" && now !== null && deadlinePassed(shown.deadline, now) ? "closed" : shown?.status;
  const text = shown && status ? shown.text.replaceAll("{status}", words[status]).replace(/\s+/g, " ").trim() : "";

  // The same element every second (useNow ticks), so Aura only redraws when the words change.
  const aura = useMemo(
    () => (
      <Aura
        variant="hero"
        size={340}
        interactive
        entrance="load"
        placard={text}
        label={text ? `Aura, the workshop's agentic AI guide, holding a placard: “${text}”` : undefined}
        className="max-w-[78vw]"
      />
    ),
    [text],
  );

  const keys = placards.map((p) => p.key).join(" ");
  useEffect(() => {
    const section = anchorRef.current?.closest("section");
    if (!section || !shown) return;
    section.dataset.placard = shown.key;
  }, [shown]);

  useEffect(() => {
    const section = anchorRef.current?.closest("section");
    if (!section) return;
    const order = keys.split(" ");
    const pick = (e: Event) => {
      const key = (e.target as Element | null)?.closest<HTMLElement>("[data-placard-key]")?.dataset.placardKey;
      const i = key ? order.indexOf(key) : -1;
      if (i >= 0) setIndex(i);
    };
    section.addEventListener("pointerover", pick);
    section.addEventListener("focusin", pick);
    return () => {
      section.removeEventListener("pointerover", pick);
      section.removeEventListener("focusin", pick);
    };
  }, [keys]);

  return (
    <>
      {aura}
      <span ref={anchorRef} hidden />
      {placards.length > 1 && shown ? (
        <div
          ref={listRef}
          role="group"
          aria-label="Aura's placards"
          className={cn(`tone-${shown.tone}`, "group/seg relative isolate z-10 -mt-2 inline-flex gap-1 rounded-[1rem] border border-border bg-surface/85 p-1 shadow-card backdrop-blur")}
        >
          <SlidingPill pillRef={pillRef} shape="rounded-[0.7rem]" className="bg-accent-soft ring-1 ring-[color-mix(in_oklab,var(--accent)_45%,transparent)] ring-inset" />
          {placards.map((p, i) => {
            const Icon = ICONS[p.key];
            const on = p.key === shown.key;
            return (
              <button
                key={p.key}
                type="button"
                aria-pressed={on}
                onClick={() => setIndex(i)}
                data-ripple=""
                className={cn(
                  "relative inline-flex items-center gap-1.5 overflow-hidden rounded-[0.7rem] px-3.5 py-2 text-sm font-semibold transition",
                  on
                    ? "bg-accent-soft text-accent-ink ring-1 ring-[color-mix(in_oklab,var(--accent)_45%,transparent)] group-data-[pill=on]/seg:bg-transparent group-data-[pill=on]/seg:ring-0"
                    : "text-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                <Icon size={15} aria-hidden />
                {p.tab}
                {on ? (
                  <span
                    key={index}
                    aria-hidden
                    onAnimationEnd={() => setIndex((n) => (n + 1) % placards.length)}
                    className="placard-timer absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-[var(--accent-ink)] opacity-50"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
