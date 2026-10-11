"use client";

import { CalendarPlus, ChevronDown, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { CalendarLinks } from "@/lib/event";
import { withBase } from "@/lib/paths";

export function AddToCalendar({
  links,
  label = "Add to calendar",
  variant = "outline",
  size = "md",
  align = "left",
  className,
}: {
  links: CalendarLinks;
  label?: string;
  variant?: "outline" | "soft" | "ghost";
  size?: "sm" | "md" | "lg";
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const item = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-fg transition-colors hover:bg-surface-2";

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className={buttonClasses(variant, size)}
      >
        <CalendarPlus size={18} aria-hidden />
        {label}
        <ChevronDown size={16} aria-hidden className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div
          className={cn(
            "absolute top-full z-30 mt-2 w-60 animate-pop rounded-2xl border border-border bg-surface p-1.5 shadow-card-lg",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          <a className={item} href={links.google} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-azure-soft text-xs font-bold text-azure-ink">G</span>
            Google Calendar
          </a>
          <a className={item} href={links.outlook} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-lilac-soft text-xs font-bold text-lilac-ink">O</span>
            Outlook.com
          </a>
          <a className={item} href={withBase(links.ics)} download onClick={() => setOpen(false)}>
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-mint-soft text-mint-ink">
              <Download size={14} aria-hidden />
            </span>
            Apple / other (.ics)
          </a>
        </div>
      ) : null}
    </div>
  );
}
