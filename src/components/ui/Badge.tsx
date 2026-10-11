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
    <span className={cn("tag font-semibold", size === "xs" && "text-[11px]", tone === "neutral" ? "tag-neutral" : `tone-${tone}`, className)}>
      {dot ? <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}
