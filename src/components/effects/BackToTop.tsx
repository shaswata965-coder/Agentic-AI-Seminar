"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 900);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
      className={cn(
        "group no-print fixed right-5 bottom-[5.25rem] z-30 grid h-11 w-11 place-items-center rounded-full border border-border bg-surface text-fg shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:text-brand sm:right-7 sm:bottom-24",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
      tabIndex={show ? 0 : -1}
      data-ripple=""
    >
      <ArrowUp size={18} aria-hidden className="group-hover:animate-[mi-hop_0.8s_ease-in-out_infinite]" />
    </button>
  );
}
