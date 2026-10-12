import { PartnerCarousel } from "@/components/partners/PartnerCarousel";
import type { Sponsor } from "@/lib/content/types";

/** Home page partners: just the looping logo strip. Tiers and sponsorship enquiries live on /partners. */
export function Partners({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <section id="partners" aria-labelledby="partners-title" className="tone-butter scroll-mt-24 py-10 sm:py-14">
      <div className="container-site">
        <h2 id="partners-title" className="sr-only">
          Partners and sponsors
        </h2>
        <PartnerCarousel sponsors={sponsors} />
      </div>
    </section>
  );
}
