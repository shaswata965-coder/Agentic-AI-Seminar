import { Award, Medal, Sparkles, Trophy } from "lucide-react";
import { Aura } from "@/components/aura/Aura";
import { cn } from "@/lib/cn";
import type { HackathonInfo } from "@/lib/content/types";

// The podium, left to right on wide screens: second, first, third. Phones list them in place order.
const PODIUM = [
  { rank: 1, tone: "tone-butter", order: "md:order-2", step: "md:h-40", Icon: Trophy },
  { rank: 2, tone: "tone-azure", order: "md:order-1", step: "md:h-28", Icon: Medal },
  { rank: 3, tone: "tone-peach", order: "md:order-3", step: "md:h-20", Icon: Medal },
] as const;
const AWARD_TONES = ["tone-lilac", "tone-mint", "tone-aqua", "tone-blush"] as const;

/** The prize money: the pool in large type, the first three prizes on a podium (Aura with the trophy on top), then any other awards. */
export function HackathonPrizes({ prizes, pool, poolLabel, awardsTitle }: { prizes: HackathonInfo["prizes"]; pool: string; poolLabel: string; awardsTitle: string }) {
  const podium = prizes.length >= 3 ? prizes.slice(0, 3) : [];
  const awards = prizes.slice(podium.length);
  return (
    <div className="grid gap-14">
      <div data-reveal="" className="tone-butter relative mx-auto w-full max-w-3xl overflow-hidden rounded-[2rem] border border-border bg-[linear-gradient(135deg,var(--butter-soft),var(--peach-soft)_55%,var(--blush-soft))] px-6 py-10 text-center shadow-card-lg sm:py-12">
        <div aria-hidden className="bg-dots pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(70%_80%_at_50%_50%,black,transparent)]" />
        <Sparkles aria-hidden size={26} className="absolute top-6 left-[12%] text-accent-ink opacity-60 animate-float" />
        <Sparkles aria-hidden size={18} className="absolute right-[14%] bottom-8 text-accent-ink opacity-50 animate-float [animation-delay:-2s]" />
        <p className="relative text-xs font-bold tracking-[0.22em] text-accent-ink uppercase">{poolLabel}</p>
        <p className="relative mt-3 font-display text-5xl leading-none font-extrabold tracking-tight text-fg tabular sm:text-7xl">{pool || "TBA"}</p>
      </div>

      {podium.length ? (
        <ol className="grid items-end gap-5 md:grid-cols-3 md:gap-6">
          {PODIUM.map(({ rank, tone, order, step, Icon }) => {
            const p = podium[rank - 1];
            return (
              <li key={rank} className={cn(tone, order, "flex flex-col")}>
                {rank === 1 ? (
                  <div className="mx-auto -mb-3 hidden md:block">
                    <Aura variant="trophy" size={140} interactive />
                  </div>
                ) : null}
                <div data-glow="" className={cn("card group relative z-10 flex flex-col items-center p-6 text-center transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-lg", rank === 1 && "ring-2 ring-[var(--accent)]")}>
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-accent-ink transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-12">
                    <Icon size={26} aria-hidden />
                  </span>
                  <p className="mt-3 font-display text-lg font-semibold text-fg">{p.place}</p>
                  <p className={cn("mt-1 font-display font-extrabold text-accent-ink tabular", rank === 1 ? "text-4xl" : "text-3xl")}>{p.reward || "TBA"}</p>
                  {p.description ? <p className="mt-2 text-sm text-muted">{p.description}</p> : null}
                </div>
                {/* The step it stands on, with its place. */}
                <div aria-hidden className={cn("-mt-4 hidden items-end justify-center rounded-b-2xl bg-[linear-gradient(180deg,var(--accent),color-mix(in_oklab,var(--accent)_55%,var(--accent-ink)))] pb-3 font-display text-4xl font-extrabold text-[#0f172a]/70 md:flex", step)}>
                  {rank}
                </div>
              </li>
            );
          })}
        </ol>
      ) : null}

      {awards.length ? (
        <div>
          {podium.length && awardsTitle ? <h3 className="mb-5 text-center font-display text-2xl font-bold text-fg">{awardsTitle}</h3> : null}
          <ul className="mx-auto flex max-w-4xl flex-wrap justify-center gap-4">
            {awards.map((p, i) => (
              <li key={`${p.place}-${i}`} data-glow="" className={cn(AWARD_TONES[i % AWARD_TONES.length], "card group flex w-full items-start gap-4 p-5 sm:w-[calc(50%-0.5rem)] transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-lg")}>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-ink transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-12">
                  {podium.length ? <Award size={22} aria-hidden /> : i === 0 ? <Trophy size={22} aria-hidden /> : <Medal size={22} aria-hidden />}
                </span>
                <div>
                  <p className="font-display text-lg font-semibold text-fg">{p.place}</p>
                  <p className="text-sm font-bold text-accent-ink">{p.reward || "TBA"}</p>
                  {p.description ? <p className="mt-1 text-sm text-muted">{p.description}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
