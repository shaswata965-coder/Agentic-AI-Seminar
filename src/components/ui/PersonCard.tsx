import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/content/constants";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";

/**
 * The shared card used for speakers, organisers, volunteers, mentors and
 * judges, so every person on the site is presented consistently.
 */
export function PersonCard({
  name,
  photo,
  title,
  subtitle,
  label,
  labelTone = "lilac",
  href,
  linkLabel = "Profile",
  footer,
  className,
  highlight,
}: {
  name: string;
  photo?: string;
  title?: string;
  subtitle?: string;
  label?: string;
  labelTone?: Tone;
  href?: string;
  linkLabel?: string;
  footer?: ReactNode;
  className?: string;
  highlight?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "group card relative flex h-full flex-col items-center overflow-hidden px-5 pt-7 pb-5 text-center transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-lg",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent)_35%,transparent),transparent_70%)] opacity-70"
      />
      <div className="relative">
        <span aria-hidden className="absolute -inset-1.5 rounded-full bg-[conic-gradient(from_120deg,var(--accent),var(--lilac),var(--mint),var(--accent))] opacity-60 blur-[2px] transition-opacity duration-300 group-hover:opacity-100" />
        <Avatar name={name} src={photo} size={104} className="relative ring-4 ring-surface" />
        {highlight ? <span className="absolute -right-1 -bottom-1">{highlight}</span> : null}
      </div>
      <h3 className="mt-4 font-display text-lg leading-snug font-semibold text-fg">{name}</h3>
      {title ? <p className="mt-1 text-sm text-muted">{title}</p> : null}
      {subtitle ? <p className="mt-0.5 text-sm font-medium text-subtle">{subtitle}</p> : null}
      {label ? (
        <div className="mt-3">
          <Badge tone={labelTone} size="xs">
            {label}
          </Badge>
        </div>
      ) : null}
      <div className="mt-auto w-full pt-4">
        {footer}
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent-ink hover:underline"
            aria-label={`${linkLabel}: ${name} (opens in a new tab)`}
          >
            {linkLabel} <ArrowUpRight size={15} aria-hidden />
          </a>
        ) : null}
      </div>
    </div>
  );
}
