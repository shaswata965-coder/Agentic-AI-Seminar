"use client";

/*
 * One shared pointer listener drives the eyes of every visible Aura on the
 * page. Positions are written straight to CSS variables (no React renders),
 * batched in a single requestAnimationFrame.
 */

type Entry = { el: HTMLElement; visible: boolean };

const entries = new Map<HTMLElement, Entry>();
const idleListeners = new Set<(idle: boolean) => void>();
let pointer: { x: number; y: number } | null = null;
let frame = 0;
let observer: IntersectionObserver | null = null;
let listening = false;
let idleTimer: ReturnType<typeof setTimeout> | undefined;
let isIdle = false;

const IDLE_AFTER_MS = 30_000;

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

function flush() {
  frame = 0;
  if (!pointer) return;
  const w = Math.max(260, window.innerWidth * 0.42);
  const h = Math.max(220, window.innerHeight * 0.42);
  for (const entry of entries.values()) {
    if (!entry.visible) continue;
    const r = entry.el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.36;
    entry.el.style.setProperty("--lx", clamp((pointer.x - cx) / w).toFixed(3));
    entry.el.style.setProperty("--ly", clamp((pointer.y - cy) / h).toFixed(3));
  }
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(flush);
}

function markActive() {
  if (isIdle) {
    isIdle = false;
    idleListeners.forEach((fn) => fn(false));
  }
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    isIdle = true;
    idleListeners.forEach((fn) => fn(true));
  }, IDLE_AFTER_MS);
}

function onPointer(ev: PointerEvent) {
  pointer = { x: ev.clientX, y: ev.clientY };
  schedule();
  markActive();
}

function ensureListening() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("pointerdown", onPointer, { passive: true });
  window.addEventListener("scroll", () => { schedule(); markActive(); }, { passive: true });
  window.addEventListener("keydown", markActive, { passive: true });
  markActive();
}

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver((items) => {
      for (const item of items) {
        const entry = entries.get(item.target as HTMLElement);
        if (entry) entry.visible = item.isIntersecting;
      }
      schedule();
    });
  }
  return observer;
}

export function motionAllowed() {
  return typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Make an element's --lx/--ly follow the pointer while it is on screen. */
export function trackLook(el: HTMLElement) {
  if (!motionAllowed()) return () => {};
  ensureListening();
  entries.set(el, { el, visible: false });
  getObserver().observe(el);
  return () => {
    entries.delete(el);
    observer?.unobserve(el);
  };
}

/** Subscribe to "the visitor has been idle for a while" changes. */
export function onIdleChange(fn: (idle: boolean) => void) {
  ensureListening();
  idleListeners.add(fn);
  return () => {
    idleListeners.delete(fn);
  };
}
