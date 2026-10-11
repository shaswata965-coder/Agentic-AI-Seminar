"use client";

import { useEffect, useRef, useState } from "react";

/** Counts numeric highlight values up when they scroll into view; "TBA" shimmers. */
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
    const tba = /^(tba|tbd|soon|coming soon)$/i.test(value.trim()) || !value.trim();
    return <span className={tba ? "shimmer-text" : undefined}>{value.trim() || "TBA"}</span>;
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
