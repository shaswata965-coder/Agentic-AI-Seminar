"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Subtle 3D tilt that follows the pointer (fine pointers only, no reduced motion). */
export function Tilt({ children, className, max = 6 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const ok = () => window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches;
  return (
    <div
      ref={ref}
      className={cn("transition-transform duration-300 ease-out [transform-style:preserve-3d] will-change-transform", className)}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el || e.pointerType !== "mouse" || !ok()) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-4px)`;
        el.style.setProperty("--mx", `${((px + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty("--my", `${((py + 0.5) * 100).toFixed(1)}%`);
      }}
      onPointerLeave={() => {
        if (ref.current) ref.current.style.transform = "";
      }}
    >
      {children}
    </div>
  );
}
