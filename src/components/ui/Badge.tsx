import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/content/constants";

export function Badge({
  tone = "azure",
  children,
  className,
  dot,
  size = "sm",
}: {
  tone?: Tone | "neutral";
  children: ReactNode;
  className?: string;
  dot?: boolean;
  size?: "xs" | "sm";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        size === "xs" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        tone === "neutral" ? "bg-surface-2 text-muted ring-1 ring-inset ring-border" : `tone-${tone} bg-accent-soft text-accent-ink`,
        className,
      )}
    >
      {dot ? <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}
