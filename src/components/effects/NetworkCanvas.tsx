"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Subtle "agent network" background: drifting nodes linked when close, gently
 * attracted to the pointer. Desktop only; paused off-screen, in background
 * tabs and for reduced motion.
 *
 * `avoid` is a selector for elements (inside the canvas's parent) the network
 * keeps clear of, with a soft edge: `data-graph-avoid="text"` clears just the
 * lines of text, any other value the element's whole box.
 */
export function NetworkCanvas({ className, density = 1, avoid }: { className?: string; density?: number; avoid?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse), (max-width: 767px)");
    if (mq.matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let holes: DOMRect[] = [];
    let visible = true;
    const pointer = { x: -9999, y: -9999 };
    type Node = { x: number; y: number; vx: number; vy: number; r: number; c: number };
    let nodes: Node[] = [];
    let palette: string[] = [];

    const readPalette = () => {
      const cs = getComputedStyle(document.documentElement);
      palette = ["--azure", "--lilac", "--mint", "--peach", "--blush"].map((v) => cs.getPropertyValue(v).trim() || "#8cc8ff");
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(80, Math.round(((w * h) / 16000) * density));
      let seed = 7;
      const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      nodes = Array.from({ length: count }, () => ({
        x: rand() * w,
        y: rand() * h,
        vx: (rand() - 0.5) * 0.25,
        vy: (rand() - 0.5) * 0.25,
        r: 1.4 + rand() * 2.2,
        c: Math.floor(rand() * 5),
      }));
    };

    const step = () => {
      raf = 0;
      // Also rests behind the home page's loading screen (components/loading), which marks <html data-launch="run">.
      if (!visible || document.hidden || document.documentElement.dataset.launch === "run") return;
      if (frame++ % 30 === 0) measure();
      ctx.clearRect(0, 0, w, h);
      const max = 130;
      for (const n of nodes) {
        const dx = pointer.x - n.x;
        const dy = pointer.y - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 180 * 180) {
          n.vx += dx * 0.00002;
          n.vy += dy * 0.00002;
        }
        n.vx *= 0.995;
        n.vy *= 0.995;
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < max) {
            ctx.globalAlpha = (1 - d / max) * 0.35;
            ctx.strokeStyle = palette[a.c];
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const pd = Math.hypot(pointer.x - a.x, pointer.y - a.y);
        if (pd < 160) {
          ctx.globalAlpha = (1 - pd / 160) * 0.55;
          ctx.strokeStyle = palette[1];
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }
      for (const n of nodes) {
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = palette[n.c];
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // Rub the network out behind text, feathered so lines fade instead of stopping dead.
      if (holes.length) {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "#000";
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 24 * dpr;
        ctx.beginPath();
        for (const r of holes) {
          if (ctx.roundRect) ctx.roundRect(r.x, r.y, r.width, r.height, 16);
          else ctx.rect(r.x, r.y, r.width, r.height);
        }
        ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(step);
    };

    // Re-read twice a second: text reflows on resize, when fonts load and when content swaps.
    const pad = 14;
    let frame = 0;
    const measure = () => {
      if (!avoid) return;
      const origin = canvas.getBoundingClientRect();
      const targets = Array.from(canvas.parentElement?.querySelectorAll<HTMLElement>(avoid) ?? []);
      holes = targets.flatMap((el) => {
        let rects: DOMRect[];
        if (el.dataset.graphAvoid === "text") {
          const range = document.createRange();
          range.selectNodeContents(el);
          rects = Array.from(range.getClientRects());
        } else rects = [el.getBoundingClientRect()];
        return rects.filter((r) => r.width && r.height).map((r) => new DOMRect(r.left - origin.left - pad, r.top - origin.top - pad, r.width + pad * 2, r.height + pad * 2));
      });
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };

    readPalette();
    resize();
    start();

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const ro = new ResizeObserver(() => {
      resize();
      measure();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(canvas);
    const mo = new MutationObserver(() => {
      readPalette();
      start();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-launch"] });
    const onVis = () => !document.hidden && start();
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [density, avoid]);

  return <canvas ref={ref} aria-hidden className={cn("pointer-events-none h-full w-full", className)} />;
}
