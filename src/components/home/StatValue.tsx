"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&?@";
const PLACEHOLDER = /^(tba|tbd|soon|coming soon)$/i;

/**
 * Text that decodes out of scrambled characters when it scrolls into view. Placeholders such as
 * "TBA" scramble again every few seconds while on screen. Each character keeps its final width,
 * so nothing around it moves; with reduced motion the text simply shows.
 */
function Scramble({ text, repeat }: { text: string; repeat: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [chars, setChars] = useState<string[] | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const letters = [...text];
    let raf = 0;
    let timer = 0;
    let visible = false;
    let started = false;
    const run = () => {
      const t0 = performance.now();
      let last = 0;
      const step = (t: number) => {
        const p = (t - t0) / 1100;
        if (p >= 1) {
          setChars(null);
          if (repeat) schedule();
          return;
        }
        // Letters settle one after another, left to right; the rest flicker every ~55 ms.
        if (t - last > 55) {
          last = t;
          setChars(letters.map((c, i) => (c === " " || p > (i + 1) / (letters.length + 1) ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])));
        }
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const schedule = () => {
      timer = window.setTimeout(() => (visible && !document.hidden ? run() : schedule()), 4000 + Math.random() * 5000);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !started) {
        started = true;
        run();
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [text, repeat]);

  return (
    <span ref={ref} className="inline-flex">
      <span className="sr-only">{text}</span>
      {[...text].map((c, i) => {
        const shown = chars ? chars[i] : c;
        return (
          <span key={i} aria-hidden className="inline-grid">
            <span className="invisible [grid-area:1/1]">{c === " " ? "\u00a0" : c}</span>
            <span className={cn("text-center [grid-area:1/1]", shown !== c && "text-[var(--accent)]")}>{shown === " " ? "\u00a0" : shown}</span>
          </span>
        );
      })}
    </span>
  );
}

/** Counts numeric highlight values up when they scroll into view; other values decode with Scramble. */
export function StatValue({ value }: { value: string }) {
  const match = /^(\D*)(\d[\d,]*)(\D*)$/.exec(value.trim());
  const ref = useRef<HTMLSpanElement>(null);
  const target = match ? Number(match[2].replace(/,/g, "")) : 0;
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    if (!match || !ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const dur = 1200;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        setShown(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  if (!match) {
    const text = value.trim() || "TBA";
    return <Scramble text={text} repeat={PLACEHOLDER.test(text)} />;
  }
  const n = shown ?? target;
  return (
    <span ref={ref} className="tabular">
      {match[1]}
      {match[2].includes(",") ? n.toLocaleString("en-IN") : n}
      {match[3]}
    </span>
  );
}
