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
import { getAnnouncements, getDemos, getFaqs, getHackathon, getKiosks, getPeople, getSettings, getSpeakers, getSponsors } from "@/lib/content/queries";
import { copy } from "@/lib/copy";
import { hackathonRegistrationHref } from "@/lib/event";
import { eventJsonLd, JsonLd } from "@/lib/jsonld";
import { explorePages, postEventNav, primaryNav, registrationNav } from "@/lib/nav";

export default async function HomePage() {
  const [s, h, announcements, speakers, sponsors, faqs, demos, kiosks, people] = await Promise.all([
    getSettings(),
    getHackathon(),
    getAnnouncements(),
    getSpeakers(),
    getSponsors(),
    getFaqs(),
    getDemos(),
    getKiosks(),
    getPeople(),
  ]);
  // What the loading screen loads behind it: the main pages, and the uploaded images they show (the
  // gallery, which can be large, is left to load when visited).
  const routes = [...primaryNav(s.siteNav), registrationNav(s.siteNav), ...explorePages(s.siteNav), ...postEventNav(s, s.siteNav), { href: hackathonRegistrationHref(s) }]
    .map((n) => n.href)
    .filter((href) => href.startsWith("/"));
  const files = [
    ...new Set(
      [s.logoIITD, s.logoScAI, s.eventLogo, ...speakers.map((x) => x.photo), ...people.map((x) => x.photo), ...sponsors.map((x) => x.logo), ...kiosks.map((x) => x.logo), ...demos.map((x) => x.image)].filter(
        (src): src is string => typeof src === "string" && src.startsWith("/"),
      ),
    ),
  ];
  return (
    <>
      {s.showLoader ? <LoadingScreen eventName={s.eventName} routes={routes} files={files} text={copy(s, "homeLoader")} /> : null}
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
