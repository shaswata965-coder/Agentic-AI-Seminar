import type { Tone } from "@/lib/content/constants";
import type { FieldDef } from "./fields";

/*
 * The words and colours of every section of the site, editable in
 * Admin → Site settings, page by page. Each entry is one section: its colour,
 * background, headings, button labels and empty-state texts. Defaults are the
 * site's original text. Shared by client and server code.
 *
 * Texts may contain placeholders such as {event} or {dates}; see src/lib/copy.ts.
 */

export type Background = "plain" | "band" | "wash";

/** How a text is used, which sets its input and its recommended length. */
type Kind = "tone" | "background" | "label" | "short" | "note" | "title" | "text" | "long";

export interface CopyField {
  kind: Kind;
  label: string;
  default: string;
  help?: string;
}

/** Recommended length (characters) per kind, and the hard limit. */
export const LENGTHS: Record<Exclude<Kind, "tone" | "background">, { min: number; max: number; cap: number }> = {
  label: { min: 1, max: 30, cap: 80 },
  short: { min: 2, max: 40, cap: 100 },
  note: { min: 8, max: 60, cap: 120 },
  title: { min: 3, max: 75, cap: 160 },
  text: { min: 12, max: 240, cap: 700 },
  long: { min: 40, max: 480, cap: 1500 },
};

const PLACEHOLDERS = "You can write {event}, {dates} or {venue}; they are filled in from Event details.";

const tone = (d: Tone, label = "Colour"): CopyField => ({ kind: "tone", label, default: d });
const bg = (d: Background): CopyField => ({ kind: "background", label: "Background", default: d });
const eyebrow = (d: string): CopyField => ({ kind: "short", label: "Label above the title", default: d });
const crumb = (d: string): CopyField => ({ kind: "label", label: "Breadcrumb", default: d });
const title = (d: string, label = "Title", help?: string): CopyField => ({ kind: "title", label, default: d, help });
const intro = (d: string, label = "Introduction", help?: string): CopyField => ({ kind: "text", label, default: d, help });
const label = (l: string, d: string, help?: string): CopyField => ({ kind: "label", label: l, default: d, help });
const short = (l: string, d: string, help?: string): CopyField => ({ kind: "short", label: l, default: d, help });
const heading = (l: string, d: string, help?: string): CopyField => ({ kind: "title", label: l, default: d, help });
const note = (l: string, d: string): CopyField => ({ kind: "note", label: l, default: d });
const text = (l: string, d: string, help?: string): CopyField => ({ kind: "text", label: l, default: d, help });
const long = (l: string, d: string, help?: string): CopyField => ({ kind: "long", label: l, default: d, help });

export const PAGE_COPY = {
  /* ------------------------------------------------------- Site-wide -- */
  siteNav: {
    home: label("Home", "Home"),
    about: label("About", "About"),
    programme: label("Programme", "Programme"),
    speakers: label("Speakers", "Speakers"),
    registration: label("Registration", "Registration"),
    tutorials: label("Tutorials & Demos", "Tutorials & Demos"),
    tutorialsText: note("Tutorials & Demos: description", "Hands-on sessions and live agent demos"),
    hackathon: label("Hackathon", "Hackathon"),
    hackathonText: note("Hackathon: description", "Tracks, rules, prizes and team registration"),
    venue: label("Venue & travel", "Venue & travel"),
    venueText: note("Venue & travel: description", "Directions, campus entry, stays and local tips"),
    partners: label("Partners & sponsors", "Partners & sponsors"),
    partnersText: note("Partners & sponsors: description", "Our partners, sponsorship tiers and how to join them"),
    organisers: label("Organisers", "Organisers"),
    organisersText: note("Organisers: description", "Faculty, student organisers and volunteers"),
    themes: label("Home: Themes", "Themes"),
    themesText: note("Themes: description", "Healthcare, scientific discovery and entrepreneurship"),
    routeMap: label("Home: Route map", "Route map"),
    routeMapText: note("Route map: description", "Follow the route to campus on the map"),
    faq: label("Home: FAQ", "FAQ"),
    faqText: note("FAQ: description", "Registration, travel, the hackathon and more"),
    contact: label("Home: Contact", "Contact"),
    contactText: note("Contact: description", "E-mail, social links and the contact form"),
    gallery: label("Photo gallery", "Photo gallery"),
    galleryText: note("Photo gallery: description", "Moments from the workshop"),
    talks: label("Slides & recordings", "Slides & recordings"),
    talksText: note("Slides & recordings: description", "Catch up on the talks"),
    meetAura: label("Meet Aura", "Meet Aura"),
  },
  siteHeader: {
    explore: label("Explore menu", "Explore"),
    pagesHeading: label("Explore menu: pages heading", "Pages"),
    sectionsHeading: label("Explore menu: home sections heading", "On the home page"),
    register: label("Register button", "Register"),
    registerNow: label("Register button (phone menu)", "Register now"),
    joinHackathon: label("Hackathon button (phone menu)", "Join the hackathon"),
  },
  siteFooter: {
    pagesHeading: label("Pages column heading", "Pages"),
    exploreHeading: label("Explore column heading", "Explore"),
    involveHeading: label("Get involved column heading", "Get involved"),
    register: label("Link: register", "Register for the workshop"),
    hackathon: label("Link: hackathon", "Join the hackathon"),
    exhibit: label("Link: exhibit", "Exhibit with us"),
    partner: label("Link: partner", "Become a partner"),
    contact: label("Link: contact", "Contact the organisers"),
    copyright: text("Copyright line", "© 2026 {organiser}. All rights reserved.", "{organiser} is the organiser's name."),
    meetAura: label("Link: Meet Aura", "Meet Aura, our mascot"),
    login: label("Link: organiser login", "Organiser login"),
  },
  siteBanner: { tone: tone("lilac") },

  /* ------------------------------------------------------------ Home -- */
  homeHero: {
    when: label("Fact: when", "When"),
    where: label("Fact: where", "Where"),
    registration: label("Fact: registration", "Registration"),
    open: label("Registration open", "Open"),
    until: label("Word before the deadline", "until"),
    soon: label("Registration opening soon", "Opening soon"),
    closed: label("Registration closed", "Closed"),
    countdown: label("Countdown label", "Starts"),
  },
  homeHighlights: { stub: label("Label on the ticket stub", "At a glance") },
  homeNews: {
    tone: tone("peach"),
    eyebrow: eyebrow("Announcements"),
    title: title("News from the organisers"),
    description: intro("Updates about registration, speakers, the programme and the hackathon appear here first."),
    emptyTitle: heading("When there are none: title", "No announcements yet"),
    emptyText: text("When there are none: text", "Check back soon: registration and speaker news will be posted here."),
    older: label("Older announcements", "Older announcements"),
    readMore: label("Default link text", "Read more"),
    pinned: label("Pinned label", "Pinned"),
    info: label("Badge: information", "Update"),
    important: label("Badge: important", "Important"),
    success: label("Badge: good news", "Good news"),
  },
  homeThemes: {
    tone: tone("lilac"),
    background: bg("band"),
    eyebrow: eyebrow("Themes"),
    title: title("Three themes, one question: what can agents do for us?"),
    description: intro("Talks, tutorials and hackathon tracks are organised around three themes."),
    theme: label("Card label", "Theme"),
    talks: label("Link: talks", "Related talks & panels"),
    tutorials: label("Link: tutorials", "Tutorials & demos"),
    track: label("Link: hackathon track", "Hackathon track"),
  },
  homeAbout: {
    tone: tone("mint"),
    background: bg("wash"),
    eyebrow: eyebrow("About the workshop"),
    portalKicker: short("Link card: label", "About the workshop"),
    portalTitle: heading("Link card: title", "Why agentic AI, and why now?"),
    portalText: text("Link card: text", "The motivation, who should attend and what happens over the two days."),
  },
  homeSpeakers: {
    tone: tone("lilac"),
    background: bg("wash"),
    eyebrow: eyebrow("Speakers"),
    title: title("Voices from academia and industry"),
    description: intro("Invited talks and panel discussions from researchers, practitioners and founders building agentic AI."),
    moreTitle: heading("“More to come” card: title", "More speakers to be announced"),
    moreText: text("“More to come” card: text", "New names are added as they confirm. Stay tuned!"),
    emptyTitle: heading("No speakers yet: title", "Speakers will be announced soon"),
    emptyText: text(
      "No speakers yet: text",
      "We are finalising an exciting line-up of keynote speakers, invited talks and panelists from academia and industry. Follow the announcements for updates.",
    ),
    emptyButton: label("No speakers yet: button", "See announcements"),
    portalKicker: short("Link card: label", "Speakers"),
    portalTitle: heading("Link card: title", "Meet all {count}", "{count} is the number of speakers, e.g. “12 speakers”."),
    portalText: text("Link card: text", "Keynotes, invited talks and panelists, with their bios, talk titles and abstracts."),
    portalEmptyTitle: heading("Link card with no speakers: title", "Speaker profiles"),
    portalEmptyText: text("Link card with no speakers: text", "Profiles, talk titles and abstracts appear here as speakers confirm."),
  },
  homeVenue: {
    tone: tone("mint"),
    background: bg("band"),
    eyebrow: eyebrow("Venue & travel"),
    title: title("Getting to IIT Delhi"),
    description: intro("Pick how you're arriving and follow the route to campus."),
    hallTba: label("Hall not set", "Hall to be announced"),
    maps: label("Map button", "Google Maps"),
    portalKicker: short("Link card: label", "Travel guide"),
    portalTitle: heading("Link card: title", "Everything for the trip"),
    portalText: text("Link card: text", "Campus entry, every route in detail, places to stay and local tips."),
  },
  homePartners: { tone: tone("butter"), title: heading("Heading (for screen readers)", "Partners and sponsors") },
  homeFaq: {
    tone: tone("lilac"),
    background: bg("wash"),
    eyebrow: eyebrow("FAQ"),
    title: title("Questions, answered"),
    description: intro("Can't find what you're looking for? Send us a message."),
    contactTone: tone("blush", "Contact card colour"),
    contactTitle: heading("Contact card: title", "Contact the organisers"),
    noEmail: text("Contact card without an e-mail address", "Official e-mail address coming soon. Use the form below."),
  },

  /* ----------------------------------------------------------- About -- */
  aboutHero: {
    tone: tone("mint"),
    crumb: crumb("About"),
    eyebrow: eyebrow("About the workshop"),
    title: title("Why agentic AI, and why now?"),
    description: intro("{tagline}", "Introduction", "{tagline} is the tagline from Event details."),
  },
  aboutMotivation: {
    tone: tone("mint"),
    background: bg("plain"),
    title: heading("Heading (for screen readers)", "Why this workshop"),
    agenticTone: tone("lilac", "“What is agentic AI?” card colour"),
    agenticTitle: heading("“What is agentic AI?” card: title", "What is agentic AI?"),
  },
  aboutAudience: { tone: tone("lilac"), background: bg("band"), eyebrow: eyebrow("Audience"), title: title("Who should attend") },
  aboutActivities: { tone: tone("peach"), background: bg("plain"), eyebrow: eyebrow("Programme"), title: title("What happens over the two days") },

  /* ------------------------------------------------------- Programme -- */
  programmeHero: {
    tone: tone("azure"),
    crumb: crumb("Programme"),
    eyebrow: eyebrow("Programme"),
    title: title("Programme"),
    description: intro(
      "{dates} at {venueName}. Keynotes, talks, panels, hands-on tutorials and live demos, with industry kiosks and the hackathon final alongside.",
      "Introduction",
      `${PLACEHOLDERS} {venueName} is the venue without the hall.`,
    ),
    pdf: label("PDF button", "Download PDF"),
  },
  programmeOverview: {
    tone: tone("azure"),
    background: bg("plain"),
    eyebrow: eyebrow("At a glance"),
    title: title("{days} of talks, panels, tutorials and demos", "Title (before sessions are added)", "{days} is the number of days, e.g. “2 days”."),
    titleWithSessions: heading("Title (once sessions are added)", "{sessions} over {days}", "{sessions} is the number of sessions, e.g. “14 sessions”."),
    description: intro("The workshop runs at {venue}. All times are IST.", "Introduction", PLACEHOLDERS),
    day: label("Day label", "Day"),
    noSessions: label("Day without sessions", "Sessions to be announced"),
    formats: label("Session formats heading", "Session formats"),
    keynote: text("Format: keynote", "Big-picture talks from leading voices in agentic AI."),
    talk: text("Format: talk", "Research and industry talks on agents at work."),
    panel: text("Format: panel", "Academia and industry debating where agents are heading."),
    tutorial: text("Format: tutorial", "Hands-on sessions where you build and run agents yourself."),
    demo: text("Format: demo", "Live agents shown working on real problems."),
    hackathon: text("Format: hackathon", "The hackathon's final round, live at the workshop."),
    themes: label("Themes heading", "Themes"),
  },
  programmeSchedule: {
    tone: tone("azure"),
    background: bg("band"),
    eyebrow: eyebrow("Schedule"),
    title: title("Day by day"),
    draft: label("Draft badge", "Draft: subject to change"),
    final: label("Final badge", "Final schedule"),
    printTip: short("Print tip", "Tip: you can also print this page."),
    filterHint: text("Hint above the schedule", "Filter by theme or session type, star sessions to build your own agenda and add them to your calendar."),
    tbaBadge: label("Before the schedule: badge", "Coming soon"),
    tbaTitle: heading("Before the schedule: title", "Schedule to be announced"),
    tbaText: text("Before the schedule: text", "Session times, rooms and speakers will appear here, with filters by theme and format, a personal agenda and calendar links."),
    tbaCalendar: label("Before the schedule: calendar button", "Add the dates to your calendar"),
    tbaRegister: label("Before the schedule: register button", "Register to get updates"),
  },
  programmeKiosks: {
    tone: tone("peach"),
    background: bg("plain"),
    eyebrow: eyebrow("Industry kiosks"),
    title: title("Meet the companies building agents"),
    button: label("Button", "Exhibit with us"),
    formTitle: heading("Enquiry form: title", "Exhibit at the workshop"),
    formText: text("Enquiry form: text", "Tell us about your company and what you'd like to showcase."),
    email: label("Words before the e-mail address", "or e-mail"),
    booth: label("Booth label", "Booth"),
    website: label("Website link", "Visit website"),
    emptyTitle: heading("No kiosks yet: title", "Exhibitor line-up coming soon"),
    emptyText: text("No kiosks yet: text", "Participating companies and the agentic technology they showcase will be listed here."),
  },
  programmeHackathon: {
    tone: tone("aqua"),
    eyebrow: eyebrow("Hackathon"),
    button: label("Button", "Register your team"),
    portalTitle: heading("Link card: title", "Rules, prizes and judging"),
    teamSize: label("Fact: team size", "Team size"),
    mode: label("Fact: mode", "Mode"),
    prizePool: label("Fact: prize pool", "Prize pool"),
    slots: heading("Schedule slots: title", "At the workshop"),
    dates: heading("Key dates: title", "Key dates"),
    dateTba: label("Date not set", "Date TBA"),
  },
  programmePlan: {
    tone: tone("mint"),
    background: bg("band"),
    eyebrow: eyebrow("Plan your visit"),
    title: title("Before you come"),
    venueTitle: heading("Card: venue title", "Venue & travel"),
    venueText: text("Card: venue text", "{venue}. Maps, directions and places to stay.", PLACEHOLDERS),
    registrationTitle: heading("Card: registration title", "Registration"),
    registrationOpen: text("Card: registration open", "Registration is open. Save your seat."),
    registrationClosed: text("Card: registration closed", "Registration has closed."),
    registrationSoon: text("Card: registration soon", "Registration opens soon."),
    tutorialsTitle: heading("Card: tutorials title", "Tutorials & demos"),
    tutorialsText: text("Card: tutorials text", "Levels, prerequisites and materials for the hands-on sessions."),
    speakersTitle: heading("Card: speakers title", "Speakers"),
    speakersText: text("Card: speakers text", "Who is speaking, their talks and the panels."),
  },

  /* -------------------------------------------------------- Speakers -- */
  speakersHero: {
    tone: tone("lilac"),
    crumb: crumb("Speakers"),
    eyebrow: eyebrow("Speakers"),
    title: title("Speakers & panelists"),
    description: intro("Researchers, practitioners and founders shaping agentic AI. Tap a card to read the bio, talk title and abstract."),
    portalKicker: short("Link card: label", "Programme"),
    portalTitle: heading("Link card: title", "When each talk happens"),
    portalText: text("Link card: text", "Day-wise schedule, panels and your own agenda."),
  },
  speakersList: {
    tone: tone("lilac"),
    emptyTitle: heading("No speakers yet: title", "More speakers to be announced"),
    emptyText: text(
      "No speakers yet: text",
      "We're finalising keynote speakers, invited talks and panelists from academia and industry. Their profiles, talk titles and abstracts will appear here as they are confirmed.",
    ),
    emptyButton: label("No speakers yet: button", "Follow the announcements"),
  },

  /* ------------------------------------------------------- Tutorials -- */
  tutorialsHero: {
    tone: tone("mint"),
    crumb: crumb("Tutorials & Demos"),
    eyebrow: eyebrow("Learn by doing"),
    title: title("Tutorials & Demos"),
    description: intro("Hands-on sessions on building and evaluating agents, plus live demos from research labs and companies. Check prerequisites before you arrive."),
    tutorialsButton: label("Button: tutorials", "Tutorials"),
    demosButton: label("Button: demos", "Demos"),
  },
  tutorialsList: { tone: tone("mint") },

  /* ------------------------------------------------------- Hackathon -- */
  hackathonHero: {
    tone: tone("aqua"),
    crumb: crumb("Hackathon"),
    eyebrow: eyebrow("Hackathon"),
    register: label("Register button", "Register your team"),
    registerOn: label("Register button (external platform)", "Register on {platform}", "{platform} is the platform name from Event → Registration."),
    open: label("Status: open", "Registration open"),
    closes: label("Status: words before the deadline", "closes"),
    closed: label("Status: closed", "Registration closed"),
    soon: label("Status: soon", "Registration opens soon"),
  },
  hackathonOverview: {
    tone: tone("aqua"),
    background: bg("plain"),
    title: title("Overview"),
    mode: label("Fact: mode", "Mode"),
    teamSize: label("Fact: team size", "Team size"),
    prizePool: label("Fact: prize pool", "Prize pool"),
    eligibility: heading("Eligibility title", "Eligibility"),
  },
  hackathonTracks: {
    tone: tone("lilac"),
    background: bg("band"),
    eyebrow: eyebrow("Problem tracks"),
    title: title("Pick a track aligned with the workshop themes"),
    description: intro("Final problem statements will be announced at launch. Here are examples to get you thinking."),
  },
  hackathonTimeline: {
    tone: tone("mint"),
    background: bg("plain"),
    eyebrow: eyebrow("Timeline"),
    title: title("From registration to the final round"),
    description: intro("Dates will be announced soon. The final round takes place live at the workshop."),
  },
  hackathonPrizes: {
    tone: tone("butter"),
    background: bg("band"),
    eyebrow: eyebrow("Prizes"),
    title: title("Prizes & recognition"),
    description: intro("Total prize pool: {prizePool}", "Introduction", "{prizePool} is the prize pool from the Hackathon page."),
    judgingEyebrow: short("Judging: label above the title", "Judging"),
    judgingTitle: heading("Judging: title", "How projects are judged"),
    judgingText: text("Judging: introduction", "Indicative criteria. Final weights will be confirmed with the rules."),
  },
  hackathonPeople: {
    tone: tone("peach"),
    background: bg("plain"),
    eyebrow: eyebrow("People"),
    title: title("Mentors & judges"),
    description: intro("Experts from academia and industry who will guide teams and evaluate projects."),
    mentors: heading("Mentors heading", "Mentors"),
    judges: heading("Judges heading", "Judges"),
    mentor: label("Card label: mentor", "Mentor"),
    judge: label("Card label: judge", "Judge"),
    emptyTitle: heading("None yet: title", "Mentors and judges will be announced soon"),
    emptyText: text("None yet: text", "They will be listed here with the same profile cards as our speakers."),
  },
  hackathonResources: {
    tone: tone("azure"),
    background: bg("band"),
    eyebrow: eyebrow("Resources"),
    title: title("APIs, datasets & compute"),
    description: intro("Resources available to registered teams."),
    open: label("Link text", "Open"),
  },
  hackathonRules: {
    tone: tone("blush"),
    background: bg("plain"),
    rules: heading("Rules title", "Rules"),
    conduct: heading("Code of conduct title", "Code of conduct"),
    faq: heading("FAQ title", "Hackathon FAQ"),
  },
  hackathonResults: {
    tone: tone("butter"),
    background: bg("wash"),
    eyebrow: eyebrow("Results"),
    title: title("Hackathon winners"),
    empty: text("Before the results", "Results will be published here after the final round."),
    project: label("Project link", "View project"),
  },
  hackathonCta: { tone: tone("aqua"), title: title("Ready to build?") },

  /* ------------------------------------------- Hackathon registration -- */
  hackathonRegisterHero: {
    tone: tone("aqua"),
    crumb: crumb("Hackathon registration"),
    eyebrow: eyebrow("Hackathon"),
    title: title("Register your team"),
    open: label("Status: open", "Registration open"),
    closed: label("Status: closed", "Registration closed"),
    soon: label("Status: soon", "Opening soon"),
  },
  hackathonRegisterForm: {
    externalTitle: heading("External platform: title", "Registration happens on {platform}", "{platform} is the platform name from Event → Registration."),
    externalText: text("External platform: text", "Create your team and submit your details on the platform. It opens in a new tab."),
    externalButton: label("External platform: button", "Go to {platform}"),
    soonTitle: heading("Opening soon: title", "Hackathon registration opens soon"),
    soonText: text(
      "Opening soon: text",
      "Start forming your team! When registration opens you will need a team name, your preferred track, member details and a short idea summary.",
    ),
    closedTitle: heading("Closed: title", "Hackathon registration is closed"),
    closedText: text("Closed: text", "Thanks to everyone who registered! Shortlisted teams will be contacted by e-mail."),
    portalTitle: heading("Link card: title", "Tracks, rules and prizes"),
  },

  /* ---------------------------------------------------- Registration -- */
  registerHero: {
    tone: tone("peach"),
    crumb: crumb("Registration"),
    eyebrow: eyebrow("Registration"),
    title: title("Register for the workshop"),
    description: intro("{dates} · {venue}. Registering takes about two minutes.", "Introduction", PLACEHOLDERS),
    hackathonBefore: short("Hackathon note: before the link", "The hackathon has a"),
    hackathonLink: short("Hackathon note: link", "separate team registration"),
    open: label("Status: open", "Registration open"),
    closed: label("Status: closed", "Registration closed"),
    soon: label("Status: soon", "Opening soon"),
  },
  registerForm: {
    externalTitle: heading("External form: title", "Register using the official form"),
    externalText: text("External form: text", "Registration is handled through an external form. It opens in a new tab."),
    externalButton: label("External form: button", "Open registration form"),
    soonTitle: heading("Opening soon: title", "Registration opens soon"),
    soonText: text(
      "Opening soon: text",
      "We're getting everything ready. Registration details, fees and deadlines will be announced here. Check the announcements for the opening date.",
    ),
    closedTitle: heading("Closed: title", "Registration is closed"),
    closedText: text("Closed: text", "Thank you for your interest! Registration for this edition has closed. Follow the announcements for updates."),
    announcements: label("Button: announcements", "See announcements"),
    contact: label("Button: contact", "Contact us"),
  },
  registerFees: {
    title: heading("Title", "Fees"),
    category: label("Column: category", "Category"),
    fee: label("Column: fee", "Fee"),
    tba: label("Amount not set", "TBA"),
  },
  registerDeadlines: {
    title: heading("Title", "Deadlines"),
    workshop: short("Workshop deadline", "Workshop registration closes"),
    hackathon: short("Hackathon deadline", "Hackathon registration closes"),
    workshopTba: text("Workshop deadline not set", "Workshop registration deadline: to be announced."),
    hackathonTba: text("Hackathon deadline not set", "Hackathon registration deadline: to be announced."),
    portalKicker: short("Hackathon card: label", "Joining the hackathon?"),
    portalTitle: heading("Hackathon card: title", "Hackathon details"),
    portalText: text("Hackathon card: text", "Teams register separately: one member registers for the whole team."),
  },

  /* -------------------------------------------------------- Partners -- */
  partnersHero: {
    tone: tone("butter"),
    crumb: crumb("Partners & sponsors"),
    eyebrow: eyebrow("Partners & sponsors"),
    title: title("Build the agentic future with us"),
    button: label("Button", "Become a partner"),
    formTitle: heading("Enquiry form: title", "Partner with us"),
    formText: text("Enquiry form: text", "Share a few details and the organisers will get in touch."),
    brochure: label("Brochure button", "Sponsorship brochure"),
  },
  partnersList: {
    tone: tone("butter"),
    background: bg("plain"),
    eyebrow: eyebrow("Our partners"),
    title: title("The organisations with us"),
    emptyTitle: heading("Title before partners are added", "Partners will be announced soon"),
  },
  partnersReach: {
    tone: tone("lilac"),
    background: bg("band"),
    eyebrow: eyebrow("Who you'll meet"),
    title: title("The people in the room"),
    description: intro("The workshop brings together the people who research, build and back agentic AI."),
  },
  partnersWays: {
    tone: tone("peach"),
    background: bg("plain"),
    eyebrow: eyebrow("Ways to take part"),
    title: title("Pick how you want to be involved"),
    sponsorTitle: heading("Card 1: title", "Sponsor the workshop"),
    sponsorText: text("Card 1: text", "Pick a sponsorship tier and put your name in front of researchers, students and founders."),
    kioskTitle: heading("Card 2: title", "Host an industry kiosk"),
    kioskText: text("Card 2: text", "Show what your team is building with agents at a booth during the workshop."),
    hackathonTitle: heading("Card 3: title", "Back the hackathon"),
    hackathonText: text("Card 3: text", "Offer prizes, mentors or a real problem statement to the student teams."),
    communityTitle: heading("Card 4: title", "Community & media"),
    communityText: text("Card 4: text", "Bring the workshop to your members or readers as a community or media partner."),
  },
  partnersTiers: {
    tone: tone("butter"),
    background: bg("band"),
    eyebrow: eyebrow("Become a partner"),
    title: title("Sponsorship opportunities"),
    description: intro("Choose a tier below, or get in touch to talk it through."),
    onRequest: label("Price not set", "On request"),
    email: short("Words before the e-mail address", "Sponsor enquiries:"),
  },

  /* ----------------------------------------------------------- Venue -- */
  venueHero: {
    tone: tone("mint"),
    crumb: crumb("Venue & travel"),
    eyebrow: eyebrow("Venue & travel"),
    title: title("Your guide to getting to IIT Delhi"),
    description: intro("Directions from the airport, the railway stations and the metro, what to bring for campus entry, where to stay and a few local tips."),
    directions: label("Button", "Directions"),
    portalKicker: short("Link card: label", "Route map"),
    portalTitle: heading("Link card: title", "Follow your route to campus"),
  },
  venuePlace: {
    tone: tone("mint"),
    background: bg("plain"),
    eyebrow: eyebrow("The venue"),
    venue: label("Card label", "Venue"),
    hall: label("Hall not set: label", "Hall / building:"),
    hallTba: label("Hall not set: badge", "to be announced"),
    openMap: label("Button: map", "Open map"),
    directions: label("Button: directions", "Directions"),
    entry: heading("Campus entry title", "Campus entry"),
  },
  venueRoutes: {
    tone: tone("azure"),
    background: bg("band"),
    eyebrow: eyebrow("Getting here"),
    title: title("By air, train, metro or road"),
    description: intro("Travel times are indicative. Check live traffic and the DMRC journey planner, or follow each route on the"),
    mapLink: label("Link at the end of the introduction", "interactive map"),
    plan: label("Route link", "Plan this route in Google Maps"),
  },
  venueStay: {
    tone: tone("peach"),
    background: bg("plain"),
    eyebrow: eyebrow("Where to stay"),
    title: title("Nearby accommodation"),
    description: intro("Guest houses, hotels and neighbourhoods within easy reach of campus."),
    details: label("Details link", "Details"),
    tipsTone: tone("butter", "Local tips card colour"),
    tips: heading("Local tips title", "Local tips"),
    portalKicker: short("Link card: label", "Travel questions?"),
    portalTitle: heading("Link card: title", "See the FAQ"),
    portalText: text("Link card: text", "Answers on registration, travel, the hackathon and more."),
  },

  /* ------------------------------------------------------ Organisers -- */
  organisersHero: {
    tone: tone("blush"),
    crumb: crumb("Organisers"),
    eyebrow: eyebrow("The team"),
    title: title("Organisers"),
    description: intro(
      "The {event} is organised by the Indian Institute of Technology Delhi and the Yardi School of Artificial Intelligence (ScAI), IIT Delhi.",
      "Introduction",
      PLACEHOLDERS,
    ),
    greeting: short("Aura's greeting", "We're the team behind the workshop!"),
  },
  organisersFaculty: { tone: tone("lilac"), background: bg("plain"), eyebrow: eyebrow("Faculty"), title: title("Faculty organisers"), card: label("Card label", "Faculty organiser") },
  organisersStudents: { tone: tone("mint"), background: bg("band"), eyebrow: eyebrow("Students"), title: title("Student organisers"), card: label("Card label", "Student organiser") },
  organisersVolunteers: {
    tone: tone("butter"),
    background: bg("plain"),
    eyebrow: eyebrow("Volunteers"),
    title: title("Volunteers"),
    description: intro("The friendly faces who keep everything running on the day."),
    card: label("Card label", "Volunteer"),
    emptyBadge: label("None yet: badge", "Coming soon"),
    emptyTitle: heading("None yet: title", "The volunteer list is on its way"),
    emptyText: text("None yet: text", "Names and photos of our volunteers will appear here soon. Want to help out at the workshop?"),
    emptyButton: label("None yet: button", "Volunteer with us"),
  },

  /* -------------------------------------------------------- Post-event -- */
  galleryHero: {
    tone: tone("peach"),
    crumb: crumb("Photo gallery"),
    eyebrow: eyebrow("Post-event"),
    title: title("Photo gallery"),
    description: intro("Moments from the {event}.", "Introduction", PLACEHOLDERS),
    empty: heading("No photos yet", "Photos are on their way!"),
  },
  talksHero: {
    tone: tone("lilac"),
    crumb: crumb("Slides & recordings"),
    eyebrow: eyebrow("Post-event"),
    title: title("Talk slides & recordings"),
    description: intro("Catch up on the talks from the {event}.", "Introduction", PLACEHOLDERS),
    slides: label("Slides button", "Slides"),
    empty: heading("No recordings yet", "Recordings will be published soon."),
  },

  /* ------------------------------------------------------- Meet Aura -- */
  auraHero: {
    tone: tone("aqua"),
    crumb: crumb("Meet Aura"),
    eyebrow: eyebrow("Our mascot"),
    title: title("Meet Aura"),
    description: long(
      "Introduction",
      "Aura is the workshop's agentic AI guide: a rounded, hovering robot with a floating head and glowing eyes. Like a real agent, she adapts to her task, so you'll find her in a different role in every section of the site. Click her for tips, or press Ctrl/⌘ + K to ask her anything.",
    ),
  },
  auraPlayground: {
    tone: tone("azure"),
    background: bg("plain"),
    eyebrow: eyebrow("Playground"),
    title: title("Mix and match"),
    description: intro("Try Aura's expressions, poses, props and effects."),
  },
  auraLooks: {
    tone: tone("lilac"),
    background: bg("band"),
    eyebrow: eyebrow("Around the site"),
    title: title("{count} looks, one guide", "Title", "{count} is the number of looks."),
    description: intro("Every page and section has its own version of Aura."),
  },
} satisfies Record<string, Record<string, CopyField>>;

export type CopyKey = keyof typeof PAGE_COPY;
type ValueOf<N> = N extends "tone" | `${string}Tone` ? Tone : N extends "background" ? Background : string;
/** The copy as stored in Site settings: one object of texts per section. */
export type PageCopy = { [K in CopyKey]: { [N in keyof (typeof PAGE_COPY)[K]]: ValueOf<N> } };

export const PAGE_COPY_DEFAULTS = Object.fromEntries(
  Object.entries(PAGE_COPY).map(([key, fields]) => [key, Object.fromEntries(Object.entries(fields).map(([name, f]) => [name, f.default]))]),
) as PageCopy;

/* ------------------------------------------------------------ Fields -- */

export const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: "azure", label: "Azure (blue)" },
  { value: "lilac", label: "Lilac (purple)" },
  { value: "mint", label: "Mint (green)" },
  { value: "peach", label: "Peach (orange)" },
  { value: "blush", label: "Blush (pink)" },
  { value: "butter", label: "Butter (yellow)" },
  { value: "aqua", label: "Aqua (cyan)" },
];

export const BACKGROUND_OPTIONS: { value: Background; label: string }[] = [
  { value: "plain", label: "Plain" },
  { value: "band", label: "Tinted band" },
  { value: "wash", label: "Soft glow" },
];

/** The admin form fields of one section's copy. */
export function copyFields(key: CopyKey): FieldDef[] {
  return Object.entries(PAGE_COPY[key] as Record<string, CopyField>).map(([name, f]): FieldDef => {
    if (f.kind === "tone") return { name, label: f.label, type: "select", options: TONE_OPTIONS, required: true, width: "half" };
    if (f.kind === "background") return { name, label: f.label, type: "select", options: BACKGROUND_OPTIONS, required: true, width: "half" };
    const { cap } = LENGTHS[f.kind];
    const multiline = f.kind === "text" || f.kind === "long";
    return {
      name,
      label: f.label,
      type: multiline ? "textarea" : "text",
      rows: f.kind === "long" ? 5 : multiline ? 2 : undefined,
      maxLength: cap,
      // Every visible title needs words; other texts may be cleared to hide them.
      required: f.kind === "title" && name === "title",
      help: f.help,
      width: !multiline && f.kind !== "title" ? "half" : undefined,
    };
  });
}

/* ----------------------------------------------------- Length checks -- */

export interface LengthIssue {
  level: "warn" | "info";
  message: string;
}

/**
 * Whether a text is so long or so short that it is likely to break the section's layout.
 * Pass the text as shown on the site, with its placeholders filled in.
 */
export function lengthIssue(key: CopyKey, name: string, value: string): LengthIssue | null {
  const f = (PAGE_COPY[key] as Record<string, CopyField>)[name];
  if (!f || f.kind === "tone" || f.kind === "background") return null;
  const { min, max } = LENGTHS[f.kind];
  const n = value.trim().length;
  if (!n) return f.kind === "title" && name === "title" ? { level: "warn", message: "Empty: the section will have no title." } : { level: "info", message: "Empty: this text won't be shown." };
  if (n > max)
    return {
      level: "warn",
      message:
        f.kind === "label"
          ? `${n} characters: buttons and labels over ${max} characters wrap or push other items out of line.`
          : f.kind === "title" || f.kind === "short" || f.kind === "note"
            ? `${n} characters: over ${max} the line wraps further and pushes the section down.`
            : `${n} characters: over ${max} this block grows much taller than the cards around it.`,
    };
  if (n < min) return { level: "warn", message: `Only ${n} character${n === 1 ? "" : "s"}: this looks unfinished and leaves a gap in the layout.` };
  return null;
}

/** Recommended length of a text field, for the counter beside it. */
export function lengthRange(key: CopyKey, name: string): { min: number; max: number } | null {
  const f = (PAGE_COPY[key] as Record<string, CopyField>)[name];
  return !f || f.kind === "tone" || f.kind === "background" ? null : { min: LENGTHS[f.kind].min, max: LENGTHS[f.kind].max };
}
