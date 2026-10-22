import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Aura } from "@/components/aura/Aura";
import { cn } from "@/lib/cn";

/** Three large 1s in one strip (one hackathon, one track, one question), the last one leading down to the question. */
export function Ones({ words, className }: { words: string[]; className?: string }) {
  const shown = words.filter(Boolean);
  if (!shown.length) return null;
  return (
    <ol className={cn("grid divide-x divide-border overflow-hidden rounded-2xl bg-surface/85 ring-1 ring-border backdrop-blur", className)} style={{ gridTemplateColumns: `repeat(${shown.length}, minmax(0, 1fr))` }}>
      {shown.map((w, i) => (
        <li key={`${w}-${i}`} className={cn("flex flex-col items-center px-2 py-3 text-center", i === shown.length - 1 && "bg-accent-soft")}>
          <span aria-hidden className="font-display text-3xl leading-none font-black text-accent-ink sm:text-4xl">
            1
          </span>
          <span className="mt-1 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
            <span className="sr-only">One </span>
            {w}
          </span>
        </li>
      ))}
    </ol>
  );
}

/**
 * The hackathon's one question, for the home page and the programme: under the three 1s, Aura thinks about the
 * question every team answers, with a link to the full challenge on the Hackathon page. The hackathon has a single
 * track, so there is nothing to choose between; the workshop's three themes are for its talks.
 */
export function OneQuestion({ question, ones, label, link, className }: { question: string; ones: string[]; label: string; link: string; className?: string }) {
  if (!question.trim()) return null;
  const n = ones.filter(Boolean).length;
  return (
    <div className={className}>
      <Ones words={ones} />
      {/* A short line from the last 1 down to the question. */}
      {n ? <span aria-hidden className="block h-3 w-0.5 -translate-x-1/2 bg-border-strong" style={{ marginLeft: `${((n - 0.5) / n) * 100}%` }} /> : null}
      <Link
        href="/hackathon#challenge"
        className="group relative flex items-center gap-3 rounded-2xl bg-surface/85 py-3 pr-4 pl-2 ring-1 ring-border backdrop-blur transition-[translate,box-shadow,background-color] duration-300 hover:-translate-y-0.5 hover:bg-surface hover:shadow-card hover:ring-[color-mix(in_oklab,var(--accent)_60%,transparent)]"
      >
        <span className="grid h-16 w-14 shrink-0 place-items-center rounded-xl bg-accent-soft">
          <Aura variant="faq" size={54} />
        </span>
        <span className="min-w-0 flex-1">
          {label ? <span className="block text-[11px] font-bold tracking-[0.12em] text-accent-ink uppercase">{label}</span> : null}
          <span className="mt-0.5 block font-display text-xl leading-snug font-bold text-fg sm:text-2xl">“{question}”</span>
          {link ? (
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-accent-ink">
              <span className="mi-underline">{link}</span>
              <ArrowRight size={15} aria-hidden className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          ) : null}
        </span>
      </Link>
    </div>
  );
}
