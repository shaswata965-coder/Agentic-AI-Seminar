import { CircleCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Aura } from "@/components/aura/Aura";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/content/constants";
import { Badge } from "./Badge";

export interface PosterFact {
  icon: ReactNode;
  label: string;
  value: string;
}

/**
 * A printed-looking poster (registration on the home page, the hackathon's "details coming soon"): a tinted head with the
 * kicker and a badge, Aura as a professor unfurling a poster and pointing at it with a laser pointer, a large
 * title, a few points with ticks, and the facts (dates, venue) along its foot. `as="h1"` when it is the page's title.
 */
export function Poster({
  tone,
  kicker,
  badge,
  title,
  text,
  pointsTitle,
  points = [],
  facts = [],
  footnote,
  children,
  as: Title = "h2",
  titleId,
  className,
}: {
  tone: Tone;
  kicker?: string;
  badge?: string;
  title: string;
  text?: string;
  pointsTitle?: string;
  points?: string[];
  facts?: PosterFact[];
  footnote?: string;
  children?: ReactNode;
  as?: "h1" | "h2";
  titleId?: string;
  className?: string;
}) {
  const list = points.filter(Boolean);
  return (
    <article className={cn(`tone-${tone} relative isolate flex flex-col overflow-hidden rounded-[2rem] border border-border bg-surface shadow-card-lg`, className)}>
      {/* The head: a tint in the poster's colour, dotted like the hero, with Aura giving her lecture in front of it. */}
      <div className="relative bg-[linear-gradient(160deg,color-mix(in_oklab,var(--accent)_38%,var(--surface)),color-mix(in_oklab,var(--lilac)_22%,var(--surface))_70%)] px-6 pt-6 sm:px-8 sm:pt-8">
        <div aria-hidden className="bg-dots pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          {kicker ? <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-accent-ink uppercase">{kicker}</p> : <span />}
          {badge ? (
            <Badge tone={tone} dot>
              {badge}
            </Badge>
          ) : null}
        </div>
        <div className="relative -mb-6 flex justify-center pt-2">
          <Aura variant="lecturer" size={250} className="max-w-[72%]" />
        </div>
      </div>

      <div className="relative flex flex-1 flex-col gap-5 px-6 pt-8 pb-6 sm:px-8 sm:pb-8">
        <div>
          <Title id={titleId} className="font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-fg sm:text-5xl">
            {title}
          </Title>
          {text ? <p className="mt-3 text-[15px] leading-relaxed text-muted sm:text-base">{text}</p> : null}
        </div>
        {list.length ? (
          <div>
            {pointsTitle ? <p className="text-xs font-bold tracking-[0.14em] text-accent-ink uppercase">{pointsTitle}</p> : null}
            <ul className="mt-2.5 grid gap-2">
              {list.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[15px] text-fg">
                  <CircleCheck size={18} aria-hidden className="mt-0.5 shrink-0 text-accent-ink" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {children ? <div className="flex flex-wrap gap-3">{children}</div> : null}
      </div>

      {/* The foot, as printed along the bottom of a poster: when, where and who. */}
      {facts.length || footnote ? (
        <div className="border-t border-dashed border-border-strong bg-accent-soft/60 px-6 py-4 sm:px-8">
          {facts.length ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              {facts.map((f) => (
                <div key={f.label} className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-accent-ink">{f.icon}</span>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-bold tracking-[0.14em] text-subtle uppercase">{f.label}</dt>
                    <dd className="font-display text-[15px] leading-snug font-semibold text-fg">{f.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          ) : null}
          {footnote ? <p className={cn("text-xs font-semibold text-subtle", facts.length && "mt-3")}>{footnote}</p> : null}
        </div>
      ) : null}
    </article>
  );
}
