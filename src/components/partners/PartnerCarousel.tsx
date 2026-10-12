import { Img } from "@/components/ui/Img";
import type { Sponsor } from "@/lib/content/types";

const PLACEHOLDERS = ["Your logo here", "Partner", "Sponsor", "Exhibitor", "Community partner", "Your logo here", "Academic partner", "Sponsor"];
const TILE = "grid h-16 w-44 shrink-0 place-items-center rounded-2xl border border-border sm:h-20 sm:w-52";

/**
 * Partner logos on a loop. Until partners are added (Admin → Partners & sponsors) it loops placeholder tiles.
 * The lap is repeated so even one or two logos fill the strip, and drawn twice so the loop has no seam.
 */
export function PartnerCarousel({ sponsors }: { sponsors: Sponsor[] }) {
  const empty = !sponsors.length;
  const count = empty ? PLACEHOLDERS.length : sponsors.length;
  const reps = Math.max(1, Math.ceil(8 / count));
  const lap = Array.from({ length: reps * 2 }, (_, k) => k);
  return (
    <div className="marquee relative overflow-hidden rounded-3xl border border-dashed border-border-strong bg-surface/60 py-6">
      {/* Tiles fade out at both ends. pr-4 matches gap-4, so translating by half the track lands exactly on the second lap. */}
      <div className="overflow-hidden py-1 [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
        <ul className="marquee-track flex w-max gap-4 pr-4">
          {lap.flatMap((k) => {
            // Only the first copy is read out and focusable; the rest are decoration.
            const copy = k > 0;
            if (empty) {
              return PLACEHOLDERS.map((t, i) => (
                <li key={`${k}-${i}`} aria-hidden={copy || undefined} className={`${TILE} bg-surface font-display text-sm font-semibold text-subtle`}>
                  {t}
                </li>
              ));
            }
            return sponsors.map((sp) => {
              const inner = sp.logo ? (
                <Img src={sp.logo} alt={copy ? "" : sp.name} className="max-h-[62%] max-w-[78%] object-contain" />
              ) : (
                <span className="px-3 text-center font-display text-[15px] leading-tight font-bold text-fg">{sp.name}</span>
              );
              const cls = `${TILE} bg-white transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card dark:bg-surface`;
              return (
                <li key={`${k}-${sp.id}`} aria-hidden={copy || undefined} className="shrink-0">
                  {sp.website ? (
                    <a href={sp.website} target="_blank" rel="noopener noreferrer" title={sp.name} tabIndex={copy ? -1 : undefined} className={cls}>
                      {inner}
                    </a>
                  ) : (
                    <div title={sp.name} className={cls}>
                      {inner}
                    </div>
                  )}
                </li>
              );
            });
          })}
        </ul>
      </div>
      {empty ? <p className="mt-4 text-center text-sm font-semibold text-muted">Partner announcements coming soon.</p> : null}
    </div>
  );
}
