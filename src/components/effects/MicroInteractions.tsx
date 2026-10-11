"use client";

import { useEffect } from "react";

/*
 * Site-wide micro-interactions, one delegated listener each (styles in
 * app/micro.css):
 * - ripple: a soft ink ripple from the pointer on [data-ripple] controls
 * - pop: a springy pop on the toggle that was just used (pressed buttons,
 *   tabs, switches, checkboxes, accordions) — never on page load
 * - glow: a light that follows the mouse across [data-glow] cards
 * Nothing runs when the visitor prefers reduced motion.
 */

const POP = '[aria-pressed], [role="tab"], [role="switch"], summary, label:has(input[type="checkbox"]), label:has(input[type="radio"]), [data-pop]';

export function MicroInteractions() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const host = (e.target as Element | null)?.closest<HTMLElement>("[data-ripple]");
      if (!host || host.matches(":disabled, [aria-disabled='true']")) return;
      const r = host.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2.2;
      const ink = document.createElement("span");
      ink.className = "mi-ripple";
      ink.setAttribute("aria-hidden", "true");
      ink.style.width = ink.style.height = `${size}px`;
      ink.style.left = `${e.clientX - r.left - size / 2}px`;
      ink.style.top = `${e.clientY - r.top - size / 2}px`;
      host.append(ink);
      const remove = () => ink.remove();
      ink.addEventListener("animationend", remove, { once: true });
      setTimeout(remove, 1000);
    };

    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>(POP);
      if (!el) return;
      el.classList.remove("mi-pop");
      void el.offsetWidth; // restart the animation on repeated clicks
      el.classList.add("mi-pop");
      setTimeout(() => el.classList.remove("mi-pop"), 700);
    };

    let frame = 0;
    let last: PointerEvent | null = null;
    const glow = () => {
      frame = 0;
      const card = (last?.target as Element | null)?.closest?.<HTMLElement>("[data-glow]");
      if (!card || !last) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${Math.round(last.clientX - r.left)}px`);
      card.style.setProperty("--my", `${Math.round(last.clientY - r.top)}px`);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      last = e;
      if (!frame) frame = requestAnimationFrame(glow);
    };

    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("click", onClick, { passive: true });
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
