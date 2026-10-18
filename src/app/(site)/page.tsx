import { About } from "@/components/home/About";
import { Announcements } from "@/components/home/Announcements";
import { FaqContact } from "@/components/home/FaqContact";
import { HackathonTeaser } from "@/components/home/HackathonTeaser";
import { Hero } from "@/components/home/Hero";
import { Highlights } from "@/components/home/Highlights";
import { Partners } from "@/components/home/Partners";
import { SpeakersPreview } from "@/components/home/SpeakersPreview";
import { Themes } from "@/components/home/Themes";
import { Venue } from "@/components/home/Venue";
import { LaunchIntro } from "@/components/launch/LaunchIntro";
import { getAnnouncements, getFaqs, getHackathon, getSettings, getSpeakers, getSponsors } from "@/lib/content/queries";
import { copy } from "@/lib/copy";
import { eventJsonLd, JsonLd } from "@/lib/jsonld";

export default async function HomePage() {
  const [s, h, announcements, speakers, sponsors, faqs] = await Promise.all([getSettings(), getHackathon(), getAnnouncements(), getSpeakers(), getSponsors(), getFaqs()]);
  return (
    <>
      {s.showIntro ? <LaunchIntro eventName={s.eventName} text={copy(s, "homeIntro")} /> : null}
      <JsonLd data={eventJsonLd(s)} />
      <Hero s={s} />
      <Highlights s={s} />
      <Announcements s={s} items={announcements} />
      <Themes s={s} />
      <About s={s} />
      <SpeakersPreview s={s} speakers={speakers} />
      <HackathonTeaser s={s} h={h} />
      <Venue s={s} />
      <Partners s={s} sponsors={sponsors} />
      <FaqContact s={s} faqs={faqs} />
    </>
  );
}
