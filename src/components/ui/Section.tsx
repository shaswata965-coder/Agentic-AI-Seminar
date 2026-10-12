import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/content/constants";
import type { TagStyle } from "./Tag";

export function Section({
  id,
  tone = "azure",
  className,
  children,
  wash = false,
  band = false,
  labelledBy,
  tags,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
  /** Soft gradient wash in the section tone. */
  wash?: boolean;
  /** Tinted background band. */
  band?: boolean;
  labelledBy?: string;
  /** Shape of the tags inside (eyebrow, badges). */
  tags?: TagStyle;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-tags={tags}
      className={cn(
        `tone-${tone} relative isolate scroll-mt-24 py-16 sm:py-24`,
        band && "bg-[color-mix(in_oklab,var(--accent-soft)_70%,var(--bg))]",
        className,
      )}
    >
      {wash ? <div aria-hidden className="wash pointer-events-none absolute inset-0 -z-10" /> : null}
      <div className="container-site">{children}</div>
    </section>
  );
}

/** A tiny agent network beside the header label: three nodes on a line, with a signal hopping toward the text. */
function Trace({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 56 16" aria-hidden focusable="false" className={cn("eyebrow-trace", flip && "-scale-x-100")}>
      <line x1="5" y1="8" x2="50" y2="8" className="eyebrow-edge" />
      <circle cx="5" cy="8" r="4" className="eyebrow-source" />
      <circle cx="27.5" cy="8" r="2.6" className="eyebrow-hop" />
      <circle cx="50" cy="8" r="3.3" className="eyebrow-target" />
      <circle cx="5" cy="8" r="2.1" className="eyebrow-pulse" />
    </svg>
  );
}

/** Section header label: open, letter-spaced text led by an agent trace (no box; see tags.css). Centred headings get a trace on both sides. */
export function Eyebrow({ children, className, centered }: { children: ReactNode; className?: string; centered?: boolean }) {
  return (
    <span className={cn("eyebrow", className)}>
      <Trace />
      <span className="min-w-0">{children}</span>
      {centered ? <Trace flip /> : null}
    </span>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "left",
  aside,
  className,
  as: Tag = "h2",
}: {
  id?: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  aside?: ReactNode;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-6 sm:mb-14",
        aside ? "md:flex-row md:items-end md:justify-between" : null,
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <Eyebrow centered={align === "center"}>{eyebrow}</Eyebrow> : null}
        <Tag
          id={id}
          className={cn(
            "mt-4 font-display font-bold text-fg",
            Tag === "h1" ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]",
          )}
        >
          {title}
        </Tag>
        {description ? <div className="mt-4 text-base text-muted sm:text-lg">{description}</div> : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  );
}
