import { Img } from "@/components/ui/Img";
import { cn } from "@/lib/cn";
import { SPONSOR_TIER_META, SPONSOR_TIERS } from "@/lib/content/constants";
import type { Sponsor } from "@/lib/content/types";

const SIZE = { xl: "h-28 sm:h-32", lg: "h-24", md: "h-20", sm: "h-16" } as const;
// Two per row for the top tier, then three, then up to six for the smaller tiers.
const WIDTH = {
  xl: "w-full sm:w-[calc((100%-1rem)/2)]",
  lg: "w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2rem)/3)]",
  md: "w-[calc((100%-1rem)/2)] sm:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-5rem)/6)]",
  sm: "w-[calc((100%-1rem)/2)] sm:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-5rem)/6)]",
} as const;
// Name-only tiles (no logo yet) grow to fit longer names.
const TEXT_SIZE = { xl: "min-h-28 sm:min-h-32", lg: "min-h-24", md: "min-h-20", sm: "min-h-16" } as const;

function Logo({ sp, size }: { sp: Sponsor; size: keyof typeof SIZE }) {
  const inner = sp.logo ? (
    <Img src={sp.logo} alt={sp.name} className="max-h-[70%] max-w-[80%] object-contain transition-[scale] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-105" />
  ) : (
    <span className="px-3 py-3 text-center font-display text-lg leading-snug font-bold break-words text-fg">{sp.name}</span>
  );
  const cls = cn("group grid w-full place-items-center rounded-2xl border border-border bg-white transition hover:-translate-y-1 hover:shadow-card-lg dark:bg-surface", sp.logo ? SIZE[size] : TEXT_SIZE[size]);
  return sp.website ? (
    <a href={sp.website} target="_blank" rel="noopener noreferrer" className={cls} title={sp.name}>
      {inner}
    </a>
  ) : (
    <div className={cls} title={sp.name}>
      {inner}
    </div>
  );
}

/** Partner logos grouped by tier, biggest tier first. */
export function SponsorTiers({ sponsors }: { sponsors: Sponsor[] }) {
  const tiers = SPONSOR_TIERS.map((t) => ({ tier: t, list: sponsors.filter((sp) => sp.tier === t) })).filter((g) => g.list.length);
  return (
    <div className="grid gap-10">
      {tiers.map(({ tier, list }) => {
        const meta = SPONSOR_TIER_META[tier];
        return (
          <div key={tier}>
            <h3 className="text-center text-xs font-bold tracking-[0.18em] text-subtle uppercase">{meta.label}</h3>
            {/* Rows are centred under the tier name, so a tier with one or two partners doesn't hug the left edge. */}
            <ul className="mt-4 flex flex-wrap justify-center gap-4">
              {list.map((sp) => (
                <li key={sp.id} className={WIDTH[meta.size]}>
                  <Logo sp={sp} size={meta.size} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
