import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/content/constants";

/**
 * A link to another page, drawn as a preview of where it leads instead of a button: a small
 * picture of the destination (components/portals/PortalArt.tsx), what you'll find there, and an
 * agent trace that sends a signal to the arrow on hover. The whole card is the link.
 */
export function Portal({
  href,
  kicker,
  title,
  text,
  art,
  tone = "azure",
  compact = false,
  className,
}: {
  href: string;
  /** Short label above the title, usually the page's name. */
  kicker: string;
  title: ReactNode;
  text?: ReactNode;
  /** The preview picture (decorative). */
  art: ReactNode;
  tone?: Tone;
  /** Smaller art and title, for heroes, asides and status cards. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      data-glow=""
      className={cn(`tone-${tone}`, "portal card group relative flex min-w-0 items-center gap-4 text-left", compact ? "p-3 pr-4" : "p-3.5 pr-5 sm:gap-5 sm:p-4 sm:pr-6", className)}
    >
      <span aria-hidden className={cn("portal-art relative grid shrink-0 place-items-center overflow-hidden rounded-[1.1rem] bg-accent-soft", compact ? "h-16 w-[4.5rem]" : "h-20 w-24 sm:h-24 sm:w-28")}>
        {art}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold tracking-[0.16em] text-accent-ink uppercase">{kicker}</span>
        <span className={cn("mt-0.5 block font-display leading-snug font-semibold text-fg", compact ? "text-base" : "text-lg sm:text-xl")}>{title}</span>
        {text ? <span className={cn("mt-1 block text-muted", compact ? "text-[13px] leading-snug" : "text-sm")}>{text}</span> : null}
      </span>
      <span aria-hidden className="flex shrink-0 items-center">
        <svg viewBox="0 0 40 12" className={cn("portal-trace h-3 w-10", compact ? "hidden" : "max-sm:hidden")} focusable="false">
          <line x1="3" y1="6" x2="38" y2="6" className="portal-edge" />
          <circle cx="3" cy="6" r="2.6" className="portal-node" />
          <circle cx="3" cy="6" r="2" className="portal-pulse" />
        </svg>
        <span className="portal-go grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent-ink">
          <ArrowRight size={18} />
        </span>
      </span>
    </Link>
  );
}
