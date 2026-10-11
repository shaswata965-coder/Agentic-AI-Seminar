import { Check, Download, Handshake } from "lucide-react";
import { Aura } from "@/components/aura/Aura";
import { EnquiryButton } from "@/components/forms/EnquiryButton";
import { ButtonLink } from "@/components/ui/Button";
import { Img } from "@/components/ui/Img";
import { Section, SectionHeading } from "@/components/ui/Section";
import { cn } from "@/lib/cn";
import { SPONSOR_TIER_META, SPONSOR_TIERS } from "@/lib/content/constants";
import type { SiteSettings, Sponsor } from "@/lib/content/types";

const SIZE = { xl: "h-28 sm:h-32", lg: "h-24", md: "h-20", sm: "h-16" } as const;
// Name-only tiles (no logo yet) grow to fit longer names.
const TEXT_SIZE = { xl: "min-h-28 sm:min-h-32", lg: "min-h-24", md: "min-h-20", sm: "min-h-16" } as const;
const TIER_TONES = ["butter", "lilac", "peach", "azure", "mint", "blush"] as const;

function Logo({ sp, size }: { sp: Sponsor; size: keyof typeof SIZE }) {
  const inner = sp.logo ? (
    <Img src={sp.logo} alt={sp.name} className="max-h-[70%] max-w-[80%] object-contain" />
  ) : (
    <span className="px-3 py-3 text-center font-display text-lg leading-snug font-bold break-words text-fg">{sp.name}</span>
  );
  const cls = cn("grid w-full place-items-center rounded-2xl border border-border bg-white transition hover:-translate-y-0.5 hover:shadow-card dark:bg-surface", sp.logo ? SIZE[size] : TEXT_SIZE[size]);
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

export function Partners({ s, sponsors }: { s: SiteSettings; sponsors: Sponsor[] }) {
  const tiers = SPONSOR_TIERS.map((t) => ({ tier: t, list: sponsors.filter((sp) => sp.tier === t) })).filter((g) => g.list.length);
  return (
    <Section id="partners" tone="butter" labelledBy="partners-title">
      <SectionHeading
        id="partners-title"
        eyebrow="Partners & sponsors"
        title="Supported by organisations that share our vision"
        description={s.sponsorshipIntro}
        aside={<Aura variant="sponsors" size={130} interactive bubbleSide="left" className="max-md:hidden" />}
      />

      {tiers.length ? (
        <div className="grid gap-10">
          {tiers.map(({ tier, list }) => {
            const meta = SPONSOR_TIER_META[tier];
            return (
              <div key={tier}>
                <h3 className="text-center text-xs font-bold tracking-[0.18em] text-subtle uppercase">{meta.label}</h3>
                <ul className={cn("mt-4 grid gap-4", meta.size === "xl" ? "grid-cols-1 sm:grid-cols-2" : meta.size === "lg" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6")}>
                  {list.map((sp) => (
                    <li key={sp.id}>
                      <Logo sp={sp} size={meta.size} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="marquee relative overflow-hidden rounded-3xl border border-dashed border-border-strong bg-surface/60 py-6" aria-label="Partner logos coming soon">
          <div className="marquee-track flex w-max gap-4 motion-desktop-only">
            {[...Array(2)].flatMap((_, k) =>
              ["Your logo here", "Partner", "Sponsor", "Exhibitor", "Community partner", "Your logo here", "Academic partner", "Sponsor"].map((t, i) => (
                <span key={`${k}-${i}`} className="grid h-16 w-44 shrink-0 place-items-center rounded-2xl border border-border bg-surface font-display text-sm font-semibold text-subtle" aria-hidden={k === 1}>
                  {t}
                </span>
              )),
            )}
          </div>
          <p className="mt-4 text-center text-sm font-semibold text-muted">Partner announcements coming soon.</p>
        </div>
      )}

      <div className="mt-14">
        <h3 className="font-display text-2xl font-bold text-fg">Sponsorship opportunities</h3>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {s.sponsorTiers.map((t, i) => (
            <li key={`${t.name}-${i}`} className={`tone-${TIER_TONES[i % TIER_TONES.length]} card flex flex-col p-6`} data-reveal style={{ ["--reveal-delay" as string]: `${i * 80}ms` }}>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-soft text-accent-ink">
                <Handshake size={21} aria-hidden />
              </span>
              <p className="mt-4 font-display text-xl font-bold text-fg">{t.name}</p>
              <p className="text-sm font-semibold text-accent-ink">{t.price || "On request"}</p>
              <ul className="mt-4 space-y-2">
                {t.perks.map((p, j) => (
                  <li key={j} className="flex gap-2 text-sm text-muted">
                    <Check size={16} aria-hidden className="mt-0.5 shrink-0 text-accent-ink" />
                    {p}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <EnquiryButton type="sponsor" label="Become a partner" title="Partner with us" description="Share a few details and the organisers will get in touch." aura="sponsors" icon={<Handshake size={18} aria-hidden />} />
          {s.sponsorBrochure ? (
            <ButtonLink href={s.sponsorBrochure} variant="outline" download icon={<Download size={17} aria-hidden />}>
              Sponsorship brochure
            </ButtonLink>
          ) : null}
          {s.contactEmail ? (
            <a className="text-sm font-semibold text-accent-ink hover:underline" href={`mailto:${s.contactEmail}?subject=${encodeURIComponent("Sponsorship enquiry — Agentic AI Workshop 2026")}`}>
              Sponsor enquiries: {s.contactEmail}
            </a>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
