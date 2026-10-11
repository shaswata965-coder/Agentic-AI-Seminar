import { ArrowUpRight, Store } from "lucide-react";
import { Aura } from "@/components/aura/Aura";
import { EnquiryButton } from "@/components/forms/EnquiryButton";
import { Img } from "@/components/ui/Img";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { Kiosk, SiteSettings } from "@/lib/content/types";

export function Kiosks({ s, kiosks }: { s: SiteSettings; kiosks: Kiosk[] }) {
  return (
    <Section id="kiosks" tone="peach" labelledBy="kiosks-title">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <SectionHeading id="kiosks-title" eyebrow="Industry kiosks" title="Meet the companies building agents" description={s.kioskIntro} className="mb-8 sm:mb-8" />
          <div className="flex flex-wrap items-center gap-3">
            <EnquiryButton
              type="exhibitor"
              label="Exhibit with us"
              title="Exhibit at the workshop"
              description="Tell us about your company and what you'd like to showcase."
              aura="kiosks"
              icon={<Store size={18} aria-hidden />}
            />
            {s.contactEmail ? (
              <a className="mi-link text-sm font-semibold text-accent-ink" href={`mailto:${s.contactEmail}?subject=${encodeURIComponent("Exhibitor enquiry — Agentic AI Workshop 2026")}`}>
                or e-mail {s.contactEmail}
              </a>
            ) : null}
          </div>
        </div>
        <div className="relative">
          {kiosks.length ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {kiosks.map((k, i) => (
                <li key={k.id} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 2) * 90}ms` }} data-glow="" className="card group flex h-full flex-col p-5 transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-lg">
                  <div className="flex items-center gap-3">
                    <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-white p-1.5 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-105 group-hover:-rotate-3">
                      {k.logo ? <Img src={k.logo} alt={`${k.company} logo`} className="max-h-full max-w-full object-contain" /> : <Store size={22} className="text-peach-ink" aria-hidden />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-lg font-semibold text-fg">{k.company}</h3>
                      {k.booth ? <p className="text-xs font-semibold text-subtle">Booth {k.booth}</p> : null}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted">{k.description}</p>
                  {k.website ? (
                    <a href={k.website} target="_blank" rel="noopener noreferrer" className="group/visit mt-auto inline-flex items-center gap-1 self-start pt-4 text-sm font-semibold text-accent-ink">
                      <span className="mi-underline">Visit website</span>
                      <ArrowUpRight size={15} aria-hidden className="transition-transform duration-300 group-hover/visit:translate-x-0.5 group-hover/visit:-translate-y-0.5" />
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <div className="card relative flex flex-col items-center overflow-hidden p-8 text-center">
              <div aria-hidden className="wash pointer-events-none absolute inset-0" />
              <div className="relative">
                <Aura variant="kiosks" size={190} interactive />
              </div>
              <p className="relative mt-2 font-display text-xl font-semibold text-fg">Exhibitor line-up coming soon</p>
              <p className="relative mt-1 max-w-sm text-sm text-muted">Participating companies and the agentic technology they showcase will be listed here.</p>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
