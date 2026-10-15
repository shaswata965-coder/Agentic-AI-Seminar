import { PartnerCarousel } from "@/components/partners/PartnerCarousel";
import type { SiteSettings, Sponsor } from "@/lib/content/types";

/** Home page partners: just the looping logo strip. Tiers and sponsorship enquiries live on /partners. */
export function Partners({ s, sponsors }: { s: SiteSettings; sponsors: Sponsor[] }) {
  const c = s.homePartners;
  return (
    <section id="partners" data-edit="home.partners" aria-labelledby="partners-title" className={`tone-${c.tone} scroll-mt-24 py-10 sm:py-14`}>
      <div className="container-site">
        <h2 id="partners-title" className="sr-only">
          {c.title}
        </h2>
        <PartnerCarousel sponsors={sponsors} />
      </div>
    </section>
  );
}
