import type { CSSProperties } from "react";
import { CmsIcon } from "@/components/ui/Icon";
import type { SiteSettings } from "@/lib/content/types";
import { StatValue } from "./StatValue";

const TONES = ["azure", "lilac", "mint", "peach", "butter", "blush"] as const;

export function Highlights({ s }: { s: SiteSettings }) {
  if (!s.highlights.length) return null;
  return (
    <section aria-label="Workshop highlights" className="container-site relative z-10 py-8 sm:py-10">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {s.highlights.map((h, i) => (
          <li
            key={`${h.label}-${i}`}
            data-reveal
            style={{ "--reveal-delay": `${i * 70}ms` } as CSSProperties}
            className={`tone-${TONES[i % TONES.length]} card group flex items-center gap-3.5 p-4 transition-transform duration-300 hover:-translate-y-1 sm:p-5 ${i === s.highlights.length - 1 && s.highlights.length % 2 === 1 ? "col-span-2 sm:col-span-1" : ""}`}
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-ink transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
              <CmsIcon name={h.icon} size={22} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-2xl leading-none font-bold text-fg sm:text-[1.75rem]">
                <StatValue value={h.value} />
              </p>
              <p className="mt-1.5 truncate text-sm font-medium text-muted">{h.label}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
