import { AuraHead } from "@/components/aura/AuraHead";

/**
 * Logo lockup: the event name (from `brandName()`) with its last word highlighted, then the year.
 * Inside a home link, pass `srSuffix` (e.g. ", home page") so the link name includes the visible text.
 */
export function BrandMark({ title, year, compact = false, srSuffix }: { title: string; year: string; compact?: boolean; srSuffix?: string }) {
  const words = title.split(/\s+/);
  const last = words.pop();
  return (
    <span className="group/brand flex items-center gap-2.5">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--azure-soft),var(--lilac-soft))] ring-1 ring-border transition-[rotate,scale] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/brand:scale-105 group-hover/brand:-rotate-6">
        <AuraHead size={30} />
      </span>
      <span className="leading-none">
        {/* Long names stop at two lines so the header keeps its height; the padding keeps descenders from being clipped. */}
        <span className="-mb-[0.15em] line-clamp-2 max-w-[14rem] pb-[0.15em] font-display text-[15px] font-bold tracking-tight text-fg">
          {words.length ? `${words.join(" ")} ` : null}
          <span className="text-gradient">{last}</span>
        </span>
        {!compact ? (
          <span className="mt-1 block text-[11px] font-semibold tracking-wide text-subtle uppercase">
            {year ? `${year} · ` : null}IIT Delhi
          </span>
        ) : null}
        {srSuffix ? <span className="sr-only">{srSuffix}</span> : null}
      </span>
    </span>
  );
}
