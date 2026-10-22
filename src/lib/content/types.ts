import type {
  PeopleGroup,
  ProgrammeStatus,
  RegistrationStatus,
  SessionType,
  SpeakerCategory,
  SponsorTier,
  ThemeKey,
} from "./constants";
import type { FormSettings } from "@/lib/forms";
import type { PageCopy } from "@/lib/schema/page-copy";
import type { SectionOrders } from "@/lib/schema/section-order";
import type { Tone } from "./constants";

export interface IconItem {
  title: string;
  icon: string;
  description: string;
}

/** Accent colours chosen in Site settings → Site-wide → Colours; empty means the built-in shade. */
export type Palette = Record<Tone, string>;

/** Everything in Admin → Site settings, including every section's texts and colours (PageCopy) and the forms' fields. */
export interface SiteSettings extends PageCopy, SectionOrders, FormSettings {
  eventName: string;
  shortName: string;
  tagline: string;
  description: string;
  organisedBy: string;
  startDate: string;
  endDate: string;
  venueName: string;
  venueHall: string;
  venueAddress: string;

  workshopStatus: RegistrationStatus;
  workshopDeadline: string;
  workshopUrl: string;
  fees: { category: string; amount: string; note: string }[];
  feeNote: string;
  confirmationNote: string;
  hackathonStatus: RegistrationStatus;
  hackathonDeadline: string;
  hackathonUrl: string;
  hackathonPlatform: string;

  /** Cache the site's files behind a loading screen on the home page (components/loading). */
  showLoader: boolean;
  /** The photo of the IIT Delhi building behind the home hero: an upload, or empty for the built-in one. */
  showHeroPhoto: boolean;
  heroPhoto: string;
  highlights: { label: string; value: string; icon: string }[];
  featuredSpeakers: number;

  motivation: string;
  agenticAI: string;
  /** Short points circled around Aura in the home page About section. */
  aboutPoints: IconItem[];
  audience: IconItem[];
  activities: IconItem[];
  themes: { key: Exclude<ThemeKey, "general">; title: string; description: string; image?: string }[];

  programmeStatus: ProgrammeStatus;
  programmeNote: string;
  schedulePdf: string;

  mapQuery: string;
  mapEmbedUrl: string;
  directions: { mode: "air" | "rail" | "metro" | "road"; title: string; details: string }[];
  campusEntry: string;
  accommodation: { name: string; kind: string; distance: string; url: string; note: string }[];
  localInfo: string[];

  sponsorshipIntro: string;
  sponsorTiers: { name: string; price: string; perks: string[] }[];
  sponsorBrochure: string;
  kioskIntro: string;

  contactEmail: string;
  contactPhone: string;
  notifyEmail: string;
  website: string;
  linkedin: string;
  x: string;
  instagram: string;
  youtube: string;

  logoIITD: string;
  logoScAI: string;
  eventLogo: string;
  brandColor: string;
  palette: Palette;
  ogImage: string;

  showMoreSpeakers: boolean;
  showAssistant: boolean;
  showGallery: boolean;
  showTalks: boolean;
  showWinners: boolean;
  bannerText: string;
  bannerLink: string;

  gaId: string;
  keywords: string[];
}

export interface HackathonInfo {
  title: string;
  tagline: string;
  overview: string;
  mode: string;
  teamSize: string;
  /** Who can form a team, in a line. */
  teamType: string;
  /** When it runs; empty means the workshop's dates. */
  dates: string;
  /** Where it runs; empty means the workshop's venue. */
  location: string;
  prizePool: string;
  eligibility: string[];
  registrationNote: string;
  /** The one question every team answers: the hackathon has a single track (the workshop's themes are for its talks). */
  question: string;
  /** What answering it involves, in a few lines. */
  challenge: string;
  /** Example directions, to get teams thinking. */
  ideas: string[];
  rules: string[];
  codeOfConduct: string;
  timeline: { label: string; date: string; dateLabel: string; description: string }[];
  prizes: { place: string; reward: string; description: string }[];
  judgingCriteria: { name: string; weight: number | null; description: string }[];
  resultsNote: string;
  winners: { position: string; team: string; project: string; members: string; description: string; link: string }[];
}

interface Doc {
  id: string;
  order?: number;
  published?: boolean;
}

export interface Announcement extends Doc {
  title: string;
  body: string;
  date: string;
  tone: "info" | "important" | "success";
  linkUrl: string;
  linkLabel: string;
  pinned: boolean;
}

export interface Speaker extends Doc {
  name: string;
  slug: string;
  designation: string;
  affiliation: string;
  category: SpeakerCategory;
  theme: ThemeKey | "";
  keynote: boolean;
  photo: string;
  bio: string;
  talkTitle: string;
  talkAbstract: string;
  website: string;
  linkedin: string;
  x: string;
  scholar: string;
  github: string;
  featured: boolean;
}

export interface Session extends Doc {
  title: string;
  day: string;
  start: string;
  end: string;
  type: SessionType;
  theme: ThemeKey;
  room: string;
  speakerNote: string;
  speakers: string[];
  moderator: string;
  panelists: string[];
  description: string;
}

export interface Tutorial extends Doc {
  title: string;
  slug: string;
  schedule: string;
  level: "beginner" | "intermediate" | "advanced" | "all";
  duration: string;
  theme: ThemeKey;
  instructors: { name: string; affiliation: string; url: string }[];
  description: string;
  prerequisites: string[];
  materials: { label: string; url: string }[];
  capacity: string;
}

export interface Demo extends Doc {
  title: string;
  team: string;
  theme: ThemeKey;
  description: string;
  image: string;
  videoUrl: string;
  link: string;
}

export interface Kiosk extends Doc {
  company: string;
  booth: string;
  logo: string;
  description: string;
  website: string;
  theme: ThemeKey | "";
}

export interface Sponsor extends Doc {
  name: string;
  tier: SponsorTier;
  logo: string;
  website: string;
  blurb: string;
}

export interface Person extends Doc {
  name: string;
  group: PeopleGroup;
  role: string;
  department: string;
  affiliation: string;
  profileUrl: string;
  photo: string;
  bio: string;
}

export interface Faq extends Doc {
  question: string;
  answer: string;
  category: string;
}

export interface GalleryItem extends Doc {
  image: string;
  caption: string;
  alt: string;
  day: string;
}

export interface Talk extends Doc {
  title: string;
  speakerName: string;
  day: string;
  description: string;
  slides: string;
  videoUrl: string;
}

export interface CollectionTypes {
  announcements: Announcement;
  speakers: Speaker;
  sessions: Session;
  tutorials: Tutorial;
  demos: Demo;
  kiosks: Kiosk;
  sponsors: Sponsor;
  people: Person;
  faqs: Faq;
  gallery: GalleryItem;
  talks: Talk;
}
export type CollectionKey = keyof CollectionTypes;
