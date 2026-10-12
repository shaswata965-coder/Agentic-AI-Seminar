"use client";

import { motionAllowed } from "./look";

/*
 * Fly-in entrances. The first time an Aura scrolls into view it flies in from
 * the nearest side of the screen and lands in its spot. One shared observer
 * measures the element once, writes the start offset to CSS variables and
 * flips `data-fly` to "go"; the flight itself is a CSS animation on the
 * compositor (transform/opacity only), see aura.css.
 */

let observer: IntersectionObserver | null = null;

function launch(el: HTMLElement, order: number) {
  const r = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const cx = r.left + r.width / 2;
  const fromRight = cx >= vw / 2;
  const centred = Math.abs(cx - vw / 2) < vw * 0.12;
  // Start just beyond the nearest screen edge, a little above the landing
  // spot, so the path is a descending arc. Centred Auras come in diagonally.
  const edge = fromRight ? vw - r.left + r.width * 0.2 : -(r.right + r.width * 0.2);
  const x = centred ? edge * 0.5 : edge;
  const y = centred ? -Math.min(r.top + r.height * 0.5, 280) : -Math.min(140, r.height * 0.55);
  el.style.setProperty("--fly-x", `${Math.round(x)}px`);
  el.style.setProperty("--fly-y", `${Math.round(y)}px`);
  el.style.setProperty("--fly-dir", fromRight ? "1" : "-1");
  el.style.setProperty("--fly-delay", `${order * 160}ms`);
  el.dataset.fly = "go";
}

function getObserver() {
  observer ??= new IntersectionObserver(
    (items) => {
      let order = 0;
      for (const item of items) {
        if (!item.isIntersecting) continue;
        observer?.unobserve(item.target);
        launch(item.target as HTMLElement, order++);
      }
    },
    { threshold: 0.3, rootMargin: "0px 0px -6% 0px" },
  );
  return observer;
}

/** Fly the element in when it first scrolls into view. Returns a cleanup. */
export function flyInOnView(el: HTMLElement) {
  if (typeof IntersectionObserver === "undefined" || !motionAllowed()) {
    el.dataset.fly = "done";
    return () => {};
  }
  getObserver().observe(el);
  return () => observer?.unobserve(el);
}
