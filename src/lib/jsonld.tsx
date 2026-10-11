import type { SiteSettings } from "./content/types";
import { absoluteUrl } from "./paths";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function eventJsonLd(s: SiteSettings, extra: Record<string, unknown> = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationEvent",
    name: s.eventName,
    description: s.description || s.tagline,
    startDate: s.startDate,
    endDate: s.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: absoluteUrl("/"),
    image: [absoluteUrl("/opengraph-image")],
    location: {
      "@type": "Place",
      name: s.venueName,
      address: s.venueAddress || s.venueName,
    },
    organizer: [
      { "@type": "CollegeOrUniversity", name: "Indian Institute of Technology Delhi", url: "https://home.iitd.ac.in" },
      { "@type": "Organization", name: "Yardi School of Artificial Intelligence, IIT Delhi", url: "https://scai.iitd.ac.in" },
    ],
    ...extra,
  };
}
