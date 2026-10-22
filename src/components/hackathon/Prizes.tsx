import { Award, Medal, Sparkles, Trophy } from "lucide-react";
import { Aura } from "@/components/aura/Aura";
import { Eyebrow } from "@/components/ui/Section";
import { cn } from "@/lib/cn";
import type { HackathonInfo } from "@/lib/content/types";

// The podium, left to right: second, first, third (the list itself stays in place order).
const PODIUM = [
  { rank: 1, tone: "tone-butter", order: "order-2", step: "h-14", Icon: Trophy },
  { rank: 2, tone: "tone-azure", order: "order-1", step: "h-9", Icon: Medal },
  { rank: 3, tone: "tone-peach", order: "order-3", step: "h-6", Icon: Medal },
] as const;
const AWARD_TONES = ["tone-lilac", "tone-mint", "tone-aqua", "tone-blush"] as const;

/**
 * The prize money as a panel beside the hackathon's At a glance facts, compact enough that both fit on one
 * screen: its heading with Aura holding the trophy, the pool, the first three prizes on a small podium, then
 * any other awards.
 */
export function HackathonPrizes({
  prizes,
  pool,
  poolLabel,
  awardsTitle,
  eyebrow,
  title,
  intro,
  titleId,
}: {
  prizes: HackathonInfo["prizes"];
  pool: string;
  poolLabel: string;
  awardsTitle: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  titleId?: string;
}) {
  const podium = prizes.length >= 3 ? prizes.slice(0, 3) : [];
  const awards = prizes.slice(podium.length);
  return (
    <div className="card relative flex h-full flex-col overflow-hidden p-5 sm:p-6">
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--accent)_45%,transparent),transparent)] opacity-80" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h3 id={titleId} className="mt-2 font-display text-2xl leading-tight font-bold text-fg">
            {title}
          </h3>
          {intro ? <p className="mt-1 text-sm text-muted">{intro}</p> : null}
        </div>
        <Aura variant="trophy" size={88} interactive className="-my-3 hidden shrink-0 sm:block" />
      </div>

      <div className="relative mt-4 overflow-hidden rounded-2xl border border-border bg-[linear-gradient(135deg,var(--butter-soft),var(--peach-soft)_55%,var(--blush-soft))] px-5 py-3.5 text-center">
        <div aria-hidden className="bg-dots pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(70%_80%_at_50%_50%,black,transparent)]" />
        <Sparkles aria-hidden size={18} className="absolute top-3 left-[10%] text-accent-ink opacity-60 animate-float" />
        <Sparkles aria-hidden size={14} className="absolute right-[12%] bottom-3 text-accent-ink opacity-50 animate-float [animation-delay:-2s]" />
        <p className="relative text-[11px] font-bold tracking-[0.22em] text-accent-ink uppercase">{poolLabel}</p>
        <p className="relative mt-1 font-display text-4xl leading-none font-extrabold tracking-tight text-fg tabular sm:text-[2.75rem]">{pool || "TBA"}</p>
      </div>

      {podium.length ? (
        <ol className="relative mt-5 grid grid-cols-3 items-end gap-2.5 sm:gap-3">
          {PODIUM.map(({ rank, tone, order, step, Icon }) => {
            const p = podium[rank - 1];
            return (
              <li key={rank} className={cn(tone, order, "flex min-w-0 flex-col")}>
                <div data-glow="" className={cn("card group relative z-10 flex flex-col items-center px-2 py-3 text-center transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-lg", rank === 1 && "ring-2 ring-[var(--accent)]")}>
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-soft text-accent-ink transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-12">
                    <Icon size={18} aria-hidden />
                  </span>
                  <p className="mt-1.5 text-[13px] leading-tight font-semibold text-fg">{p.place}</p>
                  <p className={cn("mt-0.5 font-display font-extrabold text-accent-ink tabular", rank === 1 ? "text-2xl" : "text-xl")}>{p.reward || "TBA"}</p>
                  {p.description ? <p className="mt-1 line-clamp-2 text-xs text-muted">{p.description}</p> : null}
                </div>
                {/* The step it stands on, with its place. */}
                <div aria-hidden className={cn("-mt-3 flex items-end justify-center rounded-b-xl bg-[linear-gradient(180deg,var(--accent),color-mix(in_oklab,var(--accent)_55%,var(--accent-ink)))] pb-1 font-display text-lg font-extrabold text-[#0f172a]/70", step)}>
                  {rank}
                </div>
              </li>
            );
          })}
        </ol>
      ) : null}

      {awards.length ? (
        <div className="relative mt-5">
          {podium.length && awardsTitle ? <h4 className="mb-2 text-[11px] font-bold tracking-[0.16em] text-subtle uppercase">{awardsTitle}</h4> : null}
          <ul className="grid gap-2">
            {awards.map((p, i) => (
              <li key={`${p.place}-${i}`} className={cn(AWARD_TONES[i % AWARD_TONES.length], "flex items-center gap-3 rounded-xl bg-surface-2 p-2.5 ring-1 ring-border")}>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-ink">
                  {podium.length ? <Award size={16} aria-hidden /> : i === 0 ? <Trophy size={16} aria-hidden /> : <Medal size={16} aria-hidden />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug font-semibold text-fg">{p.place}</p>
                  {p.description ? <p className="line-clamp-1 text-xs text-muted">{p.description}</p> : null}
                </div>
                <p className="shrink-0 font-display text-sm font-bold text-accent-ink tabular">{p.reward || "TBA"}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
