import { ArrowRight, Check, Download, Handshake, Megaphone, Store, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { EnquiryButton } from "@/components/forms/EnquiryButton";
import { InOrder } from "@/components/layout/InOrder";
import { PageHero } from "@/components/layout/PageHero";
import { PartnerCarousel } from "@/components/partners/PartnerCarousel";
import { SponsorTiers } from "@/components/partners/SponsorLogos";
import { ButtonLink } from "@/components/ui/Button";
import { CmsIcon } from "@/components/ui/Icon";
import { Section, SectionHeading } from "@/components/ui/Section";
import { TagScope } from "@/components/ui/Tag";
import { getSettings, getSponsors } from "@/lib/content/queries";
import { copy } from "@/lib/copy";
import { absoluteUrl } from "@/lib/paths";
import { hackathonShown } from "@/lib/event";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: "Partners & sponsors",
    description: `Partners of the ${s.eventName}, sponsorship tiers and how to become a partner.`,
    alternates: { canonical: absoluteUrl("/partners") },
  };
}

const TONES = ["butter", "lilac", "peach", "azure", "mint", "blush"] as const;

export default async function PartnersPage() {
  const [s, sponsors] = await Promise.all([getSettings(), getSponsors()]);
  const hero = copy(s, "partnersHero");
  const li = copy(s, "partnersList");
  const reach = copy(s, "partnersReach");
  const ways = copy(s, "partnersWays");
  const tiers = copy(s, "partnersTiers");
  const WAYS: { title: string; text: string; href: string; icon: ReactNode; tone: string }[] = [
    { title: ways.sponsorTitle, text: ways.sponsorText, href: "#become-a-partner", icon: <Handshake size={21} aria-hidden />, tone: "tone-butter" },
    { title: ways.kioskTitle, text: ways.kioskText, href: "/programme#kiosks", icon: <Store size={21} aria-hidden />, tone: "tone-peach" },
    ...(hackathonShown(s) ? [{ title: ways.hackathonTitle, text: ways.hackathonText, href: "/hackathon", icon: <Trophy size={21} aria-hidden />, tone: "tone-aqua" }] : []),
    { title: ways.communityTitle, text: ways.communityText, href: "#become-a-partner", icon: <Megaphone size={21} aria-hidden />, tone: "tone-lilac" },
  ].filter((w) => w.title);
  const enquire = <EnquiryButton type="sponsor" fields={s.partnerFields} text={copy(s, "partnerFormText")} label={hero.button} title={hero.formTitle} description={hero.formText} aura="sponsors" icon={<Handshake size={18} aria-hidden />} />;
  const brochure = s.sponsorBrochure ? (
    <ButtonLink href={s.sponsorBrochure} variant="outline" download icon={<Download size={17} aria-hidden />}>
      {hero.brochure}
    </ButtonLink>
  ) : null;
  return (
    <TagScope style="ribbon">
      <PageHero edit="partners.hero" home={s.siteNav.home} tone={hero.tone} crumb={hero.crumb} eyebrow={hero.eyebrow} title={hero.title} aura="sponsors" description={s.sponsorshipIntro}>
        {enquire}
        {brochure}
      </PageHero>

      <InOrder
        s={s}
        page="partners"
        sections={{
          list: (
            <Section edit="partners.list" tone={li.tone} bg={li.background} labelledBy="our-partners-title">
              <SectionHeading id="our-partners-title" align="center" eyebrow={li.eyebrow} title={sponsors.length ? li.title : li.emptyTitle} className="mb-8 sm:mb-10" />
              {sponsors.length ? <SponsorTiers sponsors={sponsors} /> : <PartnerCarousel sponsors={sponsors} />}
            </Section>
          ),
          reach: s.audience.length ? (
            <Section edit="partners.reach" tone={reach.tone} bg={reach.background} labelledBy="reach-title">
              <SectionHeading id="reach-title" eyebrow={reach.eyebrow} title={reach.title} description={reach.description} className="mb-8 sm:mb-10" />
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {s.audience.map((a, i) => (
                  <li key={a.title} data-reveal style={{ "--reveal-delay": `${i * 60}ms` } as CSSProperties} className={`tone-${TONES[(i + 1) % 6]} card flex items-start gap-3 p-4 lg:flex-col lg:p-5`}>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink">
                      <CmsIcon name={a.icon} size={19} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display font-semibold text-fg">{a.title}</span>
                      <span className="mt-0.5 block text-sm text-muted">{a.description}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null,
          ways: (
            <Section edit="partners.ways" tone={ways.tone} bg={ways.background} labelledBy="ways-title">
              <SectionHeading id="ways-title" eyebrow={ways.eyebrow} title={ways.title} className="mb-8 sm:mb-10" />
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {WAYS.map((w, i) => (
                  <li key={w.title} data-reveal style={{ "--reveal-delay": `${i * 70}ms` } as CSSProperties}>
                    <Link href={w.href} data-glow="" className={`${w.tone} card group flex h-full flex-col p-6 transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-lg`}>
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-soft text-accent-ink transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:rotate-6">{w.icon}</span>
                      <span className="mt-4 flex items-center gap-1.5 font-display text-lg font-semibold text-fg">
                        {w.title}
                        <ArrowRight size={16} aria-hidden className="opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                      </span>
                      <span className="mt-1.5 text-sm text-muted">{w.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          ),
          tiers: (
            <Section id="become-a-partner" edit="partners.tiers" tone={tiers.tone} bg={tiers.background} labelledBy="tiers-title">
              <SectionHeading id="tiers-title" eyebrow={tiers.eyebrow} title={tiers.title} description={tiers.description} className="mb-8 sm:mb-10" />
              {s.sponsorTiers.length ? (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {s.sponsorTiers.map((t, i) => (
                    <li key={`${t.name}-${i}`} className={`tone-${TONES[i % TONES.length]} card group flex flex-col p-6 transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-lg`} data-reveal data-glow="" style={{ "--reveal-delay": `${i * 80}ms` } as CSSProperties}>
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-soft text-accent-ink transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:rotate-6">
                        <Handshake size={21} aria-hidden />
                      </span>
                      <p className="mt-4 font-display text-xl font-bold text-fg">{t.name}</p>
                      <p className="text-sm font-semibold text-accent-ink">{t.price || tiers.onRequest}</p>
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
              ) : null}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {enquire}
                {brochure}
                {s.contactEmail ? (
                  <a className="mi-underline text-sm font-semibold text-accent-ink" href={`mailto:${s.contactEmail}?subject=${encodeURIComponent(`Sponsorship enquiry · ${s.eventName}`)}`}>
                    {tiers.email ? `${tiers.email} ${s.contactEmail}` : s.contactEmail}
                  </a>
                ) : null}
              </div>
            </Section>
          ),
        }}
      />
    </TagScope>
  );
}
