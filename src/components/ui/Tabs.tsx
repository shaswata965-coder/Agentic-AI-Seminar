"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SlidingPill, useSlidingPill } from "./SlidingPill";

export interface TabItem {
  id: string;
  label: ReactNode;
  panel: ReactNode;
}

/** WAI-ARIA tabs with roving focus (←/→/Home/End) and an animated pill. */
export function Tabs({
  items,
  initial,
  onChange,
  className,
  listClassName,
  ariaLabel,
}: {
  items: TabItem[];
  initial?: string;
  onChange?: (id: string) => void;
  className?: string;
  listClassName?: string;
  ariaLabel: string;
}) {
  const uid = useId();
  const [active, setActive] = useState(initial ?? items[0]?.id);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const { listRef, pillRef } = useSlidingPill(active, '[aria-selected="true"]');

  const select = (id: string, focus = false) => {
    setActive(id);
    onChange?.(id);
    if (focus) refs.current[items.findIndex((t) => t.id === id)]?.focus();
  };

  const onKey = (e: KeyboardEvent, i: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % items.length;
    if (e.key === "ArrowLeft") next = (i - 1 + items.length) % items.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = items.length - 1;
    if (next >= 0) {
      e.preventDefault();
      select(items[next].id, true);
    }
  };

  return (
    <div className={className}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={ariaLabel}
        className={cn("group/seg relative isolate inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-border bg-surface p-1 shadow-card", listClassName)}
      >
        <SlidingPill pillRef={pillRef} className="bg-accent-soft shadow-sm ring-1 ring-[color-mix(in_oklab,var(--accent)_45%,transparent)] ring-inset" />
        {items.map((t, i) => {
          const selected = t.id === active;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              id={`${uid}-tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${uid}-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              data-ripple=""
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-[color,background-color,scale] duration-200",
                selected
                  ? "bg-accent-soft text-accent-ink shadow-sm ring-1 ring-[color-mix(in_oklab,var(--accent)_45%,transparent)] ring-inset group-data-[pill=on]/seg:bg-transparent group-data-[pill=on]/seg:shadow-none group-data-[pill=on]/seg:ring-0"
                  : "text-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {items.map((t) => (
        <div
          key={t.id}
          id={`${uid}-panel-${t.id}`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${t.id}`}
          hidden={t.id !== active}
          tabIndex={0}
          className="mt-6 animate-fade-up focus-visible:outline-none"
        >
          {t.panel}
        </div>
      ))}
    </div>
  );
}
