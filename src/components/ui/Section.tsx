import type { ReactNode } from "react";
import { MiniAura } from "@/components/aura/MiniAura";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/content/constants";
import type { Background } from "@/lib/schema/page-copy";
import type { TagStyle } from "./Tag";

export function Section({
  id,
  tone = "azure",
  className,
  children,
  bg = "plain",
  wash = bg === "wash",
  band = bg === "band",
  labelledBy,
  tags,
  edit,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
  /** Background chosen in Site settings: plain, a tinted band or a soft glow. */
  bg?: Background;
  /** Soft gradient wash in the section tone. */
  wash?: boolean;
  /** Tinted background band. */
  band?: boolean;
  labelledBy?: string;
  /** Shape of the tags inside (eyebrow, badges). */
  tags?: TagStyle;
  /** Where this section is edited in Site settings ("page.section"), for the live preview. */
  edit?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-tags={tags}
      data-edit={edit}
      className={cn(
        `tone-${tone} relative isolate scroll-mt-24 py-14 sm:py-20`,
        band && "bg-[color-mix(in_oklab,var(--accent-soft)_70%,var(--bg))]",
        className,
      )}
    >
      {wash ? <div aria-hidden className="wash pointer-events-none absolute inset-0 -z-10" /> : null}
      <div className="container-site">{children}</div>
    </section>
  );
}

/** Section header label: open, letter-spaced text led by a mini Aura in the section's colour (no box; see tags.css). Centred headings get one on each side, facing the label. */
export function Eyebrow({ children, className, centered }: { children: ReactNode; className?: string; centered?: boolean }) {
  return (
    <span className={cn("eyebrow", className)}>
      <MiniAura />
      <span className="min-w-0">{children}</span>
      {centered ? <MiniAura flip className="mini-aura-late" /> : null}
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
        "mb-8 flex flex-col gap-6 sm:mb-12",
        aside ? "md:flex-row md:items-end md:justify-between" : null,
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl xl:max-w-3xl", align === "center" && "mx-auto")}>
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
