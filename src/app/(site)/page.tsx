import { About } from "@/components/home/About";
import { Announcements } from "@/components/home/Announcements";
import { FaqContact } from "@/components/home/FaqContact";
import { HackathonTeaser } from "@/components/home/HackathonTeaser";
import { Hero } from "@/components/home/Hero";
import { Highlights } from "@/components/home/Highlights";
import { Kiosks } from "@/components/home/Kiosks";
import { Partners } from "@/components/home/Partners";
import { ProgrammePreview } from "@/components/home/ProgrammePreview";
import { SpeakersPreview } from "@/components/home/SpeakersPreview";
import { Themes } from "@/components/home/Themes";
import { Venue } from "@/components/home/Venue";
import {
  getAnnouncements,
  getFaqs,
  getHackathon,
  getKiosks,
  getSessions,
  getSettings,
  getSpeakers,
  getSponsors,
} from "@/lib/content/queries";
import { eventJsonLd, JsonLd } from "@/lib/jsonld";

export default async function HomePage() {
  const [s, h, announcements, speakers, sessions, kiosks, sponsors, faqs] = await Promise.all([
    getSettings(),
    getHackathon(),
    getAnnouncements(),
    getSpeakers(),
    getSessions(),
    getKiosks(),
    getSponsors(),
    getFaqs(),
  ]);
  return (
    <>
      <JsonLd data={eventJsonLd(s)} />
      <Hero s={s} />
      <Highlights s={s} />
      <Announcements items={announcements} />
      <About s={s} />
      <Themes s={s} />
      <ProgrammePreview s={s} sessions={sessions} speakers={speakers} />
      <SpeakersPreview s={s} speakers={speakers} />
      <HackathonTeaser s={s} h={h} />
      <Kiosks s={s} kiosks={kiosks} />
      <Venue s={s} />
      <Partners s={s} sponsors={sponsors} />
      <FaqContact s={s} faqs={faqs} />
    </>
  );
}
