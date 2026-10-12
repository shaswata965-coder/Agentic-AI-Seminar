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

/** Section header label: an "agent node" with a slowly orbiting signal, and the label on a card with a gradient edge (see tags.css). */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("eyebrow", className)}>
      <span aria-hidden className="eyebrow-mark">
        <svg viewBox="0 0 24 24" focusable="false">
          <circle cx="12" cy="12" r="8.5" className="eyebrow-ring" />
          <circle cx="12" cy="12" r="3.6" className="eyebrow-core" />
          <circle cx="20.5" cy="12" r="2.6" className="eyebrow-signal" />
        </svg>
      </span>
      <span className="min-w-0">{children}</span>
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
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
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
