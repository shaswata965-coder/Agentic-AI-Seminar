"use client";

import { useState, type CSSProperties } from "react";

const COLORS = ["#ff8fb8", "#ffd166", "#5ef0b8", "#7cc3ff", "#b9a3ff", "#ffab7a"];

/** A one-off confetti burst (pure CSS animation, skipped for reduced motion). */
export function Confetti({ pieces = 70 }: { pieces?: number }) {
  const [bits] = useState(() =>
    Array.from({ length: pieces }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      dur: 2.2 + Math.random() * 1.8,
      dx: (Math.random() - 0.5) * 240,
      rot: 360 + Math.random() * 720,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 10,
      round: i % 4 === 0,
      color: COLORS[i % COLORS.length],
    })),
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70] overflow-hidden motion-reduce:hidden">
      {bits.map((b, i) => (
        <span
          key={i}
          className="absolute -top-4 block"
          style={
            {
              left: `${b.left}%`,
              width: b.w,
              height: b.round ? b.w : b.h,
              background: b.color,
              borderRadius: b.round ? 999 : 2,
              animation: `confetti-fall ${b.dur}s cubic-bezier(.2,.6,.4,1) ${b.delay}s forwards`,
              "--dx": `${b.dx}px`,
              "--rot": `${b.rot}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
