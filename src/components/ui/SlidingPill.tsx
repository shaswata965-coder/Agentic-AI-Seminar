"use client";

import { useEffect, useRef, type Ref } from "react";
import { cn } from "@/lib/cn";

/**
 * Animated indicator for segmented controls and tab lists: a pill that slides
 * under the selected item. Positions are written straight to the DOM (no
 * re-render). Until the first measurement the selected item keeps its own
 * background, so nothing jumps on load. Give the list `group/seg` and style
 * the selected item with `group-data-[pill=on]/seg:bg-transparent` etc.
 */
export function useSlidingPill<T extends HTMLElement = HTMLDivElement>(selection: unknown, selector = '[aria-selected="true"], [aria-pressed="true"]') {
  const listRef = useRef<T>(null);
  const pillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const pill = pillRef.current;
    if (!list || !pill) return;
    const place = () => {
      const item = list.querySelector<HTMLElement>(selector);
      if (!item) {
        pill.style.opacity = "0";
        return;
      }
      pill.style.opacity = "";
      pill.style.width = `${item.offsetWidth}px`;
      pill.style.height = `${item.offsetHeight}px`;
      pill.style.transform = `translate(${item.offsetLeft}px, ${item.offsetTop}px)`;
      if (list.dataset.pill !== "on") {
        void pill.offsetWidth; // position it before the transition switches on
        list.dataset.pill = "on";
      }
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(list);
    return () => ro.disconnect();
  }, [selection, selector]);

  return { listRef, pillRef };
}

/** The moving pill. Place it as the first child of the (relative, isolated) list.
 * Eases out without overshoot so long jumps never fling it past the track. */
export function SlidingPill({ pillRef, className }: { pillRef: Ref<HTMLSpanElement>; className?: string }) {
  return (
    <span
      ref={pillRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-0 left-0 -z-10 rounded-full opacity-0 group-data-[pill=on]/seg:opacity-100 group-data-[pill=on]/seg:transition-[transform,width,height,opacity] group-data-[pill=on]/seg:duration-[350ms] group-data-[pill=on]/seg:ease-[cubic-bezier(0.22,1,0.36,1)]",
        className,
      )}
    />
  );
}
