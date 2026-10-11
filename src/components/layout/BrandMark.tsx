import { AuraHead } from "@/components/aura/AuraHead";

/** Logo lockup. Inside a home link, pass `srSuffix` (e.g. ", home page") so the link name includes the visible text. */
export function BrandMark({ shortName, compact = false, srSuffix }: { shortName: string; compact?: boolean; srSuffix?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--azure-soft),var(--lilac-soft))] ring-1 ring-border">
        <AuraHead size={30} />
      </span>
      <span className="leading-none">
        <span className="block font-display text-[15px] font-bold tracking-tight text-fg">
          Agentic AI <span className="text-gradient">Workshop</span>
        </span>
        {!compact ? (
          <span className="mt-1 block text-[11px] font-semibold tracking-wide text-subtle uppercase">
            {shortName.replace(/[^0-9]/g, "") || "2026"} · IIT Delhi
          </span>
        ) : null}
        {srSuffix ? <span className="sr-only">{srSuffix}</span> : null}
      </span>
    </span>
  );
}
