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
import { LoadingScreen } from "@/components/loading/LoadingScreen";
import { getAnnouncements, getFaqs, getHackathon, getSettings, getSpeakers, getSponsors } from "@/lib/content/queries";
import { copy } from "@/lib/copy";
import { hackathonRegistrationHref } from "@/lib/event";
import { eventJsonLd, JsonLd } from "@/lib/jsonld";
import { explorePages, postEventNav, primaryNav, registrationNav } from "@/lib/nav";

export default async function HomePage() {
  const [s, h, announcements, speakers, sponsors, faqs] = await Promise.all([getSettings(), getHackathon(), getAnnouncements(), getSpeakers(), getSponsors(), getFaqs()]);
  // The pages the loading screen caches the files of, and prefetches.
  const routes = [...primaryNav(s.siteNav), registrationNav(s.siteNav), ...explorePages(s.siteNav), ...postEventNav(s, s.siteNav), { href: hackathonRegistrationHref(s) }]
    .map((n) => n.href)
    .filter((href) => href.startsWith("/"));
  return (
    <>
      {s.showLoader ? <LoadingScreen eventName={s.eventName} routes={routes} text={copy(s, "homeLoader")} /> : null}
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
