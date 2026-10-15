import { About } from "@/components/home/About";
import { Announcements } from "@/components/home/Announcements";
import { FaqContact } from "@/components/home/FaqContact";
import { Hero } from "@/components/home/Hero";
import { Highlights } from "@/components/home/Highlights";
import { Partners } from "@/components/home/Partners";
import { SpeakersPreview } from "@/components/home/SpeakersPreview";
import { Themes } from "@/components/home/Themes";
import { Venue } from "@/components/home/Venue";
import { getAnnouncements, getFaqs, getSettings, getSpeakers, getSponsors } from "@/lib/content/queries";
import { eventJsonLd, JsonLd } from "@/lib/jsonld";

export default async function HomePage() {
  const [s, announcements, speakers, sponsors, faqs] = await Promise.all([getSettings(), getAnnouncements(), getSpeakers(), getSponsors(), getFaqs()]);
  return (
    <>
      <JsonLd data={eventJsonLd(s)} />
      <Hero s={s} />
      <Highlights s={s} />
      <Announcements s={s} items={announcements} />
      <Themes s={s} />
      <About s={s} />
      <SpeakersPreview s={s} speakers={speakers} />
      <Venue s={s} />
      <Partners s={s} sponsors={sponsors} />
      <FaqContact s={s} faqs={faqs} />
    </>
  );
}
