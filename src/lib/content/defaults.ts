import { FORM_DEFAULTS, FORM_SETTINGS, formFields, type FormKey } from "@/lib/forms";
import { PAGE_COPY_DEFAULTS } from "@/lib/schema/page-copy";
import { HIDDEN_SECTIONS_DEFAULTS, SECTION_ORDER_DEFAULTS } from "@/lib/schema/section-order";
import type { Faq, HackathonInfo, Person, SiteSettings } from "./types";

/*
 * Default content. Used when the database is not configured/reachable and to
 * bootstrap a fresh database on first run. Everything here can be edited in
 * the admin panel. Items still pending from the organisers are marked TBA.
 */

export const DEFAULT_SETTINGS: SiteSettings = {
  ...PAGE_COPY_DEFAULTS,
  ...SECTION_ORDER_DEFAULTS,
  ...HIDDEN_SECTIONS_DEFAULTS,
  ...FORM_DEFAULTS,
  eventName: "Agentic AI Workshop 2026",
  shortName: "AAIW 2026",
  tagline: "Where autonomous AI agents meet healthcare, science and enterprise.",
  description:
    "A two-day workshop at IIT Delhi on agentic AI: invited talks, panel discussions, hands-on tutorials, live demos, industry kiosks and a hackathon. 15–16 December 2026.",
  organisedBy: "Indian Institute of Technology Delhi and Yardi School of Artificial Intelligence (ScAI), IIT Delhi",
  startDate: "2026-12-15T09:00:00+05:30",
  endDate: "2026-12-16T18:00:00+05:30",
  venueName: "IIT Delhi, Hauz Khas, New Delhi",
  venueHall: "",
  venueAddress: "Indian Institute of Technology Delhi, Hauz Khas, New Delhi 110016, India",

  workshopStatus: "open",
  workshopDeadline: "",
  workshopUrl: "",
  fees: [
    { category: "Students", amount: "To be announced", note: "" },
    { category: "Academia & researchers", amount: "To be announced", note: "" },
    { category: "Industry & startups", amount: "To be announced", note: "" },
  ],
  feeNote: "Registration fees (if any) and deadlines will be announced soon.",
  confirmationNote: "",
  hackathonStatus: "soon",
  hackathonDeadline: "",
  hackathonUrl: "",
  hackathonPlatform: "",

  showLoader: true,
  showHeroPhoto: true,
  heroPhoto: "",
  highlights: [
    { label: "Speakers", value: "TBA", icon: "mic" },
    { label: "Tutorials", value: "TBA", icon: "graduation" },
    { label: "Live demos", value: "TBA", icon: "monitor" },
    { label: "Industry kiosks", value: "TBA", icon: "store" },
    { label: "Prize pool", value: "TBA", icon: "trophy" },
  ],
  featuredSpeakers: 8,

  motivation:
    "AI systems are moving from answering questions to **taking actions**: planning multi-step tasks, using tools, collaborating with people and other agents, and learning from feedback. This shift opens remarkable opportunities and raises hard questions about reliability, safety and accountability.\n\nThe Agentic AI Workshop 2026 brings together researchers, practitioners, founders and investors at IIT Delhi to take stock of where agentic AI stands, where it is heading, and how it can create real impact in **healthcare**, **scientific discovery** and **enterprise**.",
  agenticAI:
    "Agentic AI refers to systems that pursue goals with a degree of autonomy. Instead of producing a single response, an agent **perceives** its environment, **reasons** about what to do, **plans** a sequence of steps, **acts** using tools, APIs or other agents, and **reflects** on the outcome to improve. Large language models often act as the reasoning engine, combined with memory, tool use and human oversight.",
  aboutPoints: [
    { title: "Why now", icon: "rocket", description: "AI is moving from answering questions to taking actions: big opportunities, and hard questions about reliability, safety and accountability." },
    { title: "Agentic AI", icon: "sparkles", description: "Systems that pursue goals with a degree of autonomy, using tools, other agents and human oversight to get things done." },
    { title: "The agent loop", icon: "code", description: "Perceive, reason, plan, act, reflect: the cycle an agent repeats, often with a large language model as its engine." },
    { title: "Three themes", icon: "heart", description: "Healthcare, scientific discovery and enterprise: where agents can create real impact." },
    { title: "Who it is for", icon: "users", description: "Researchers, students, industry practitioners, founders and investors." },
    { title: "Two full days", icon: "calendar", description: "{dates}: invited talks, panel discussions, hands-on tutorials, live demos and industry kiosks." },
    { title: "Hackathon", icon: "trophy", description: "One track and one question for every team, with the finals live at the workshop." },
  ],
  audience: [
    { title: "Researchers & faculty", icon: "landmark", description: "Share and discover the latest advances in agents, planning and multi-agent systems." },
    { title: "Students", icon: "graduation", description: "Learn hands-on in tutorials, meet mentors and build in the hackathon." },
    { title: "Industry practitioners", icon: "briefcase", description: "See what works in production and connect with research teams." },
    { title: "Startups & founders", icon: "rocket", description: "Showcase your product at the kiosks and meet collaborators." },
    { title: "Investors", icon: "sparkles", description: "Spot emerging agentic AI ventures and the talent behind them." },
  ],
  activities: [
    { title: "Invited talks", icon: "mic", description: "Keynotes and talks from leading academic and industry voices." },
    { title: "Panel discussions", icon: "users", description: "Debates on the opportunities, risks and road ahead." },
    { title: "Tutorials", icon: "graduation", description: "Hands-on sessions on building and evaluating agents." },
    { title: "Live demos", icon: "monitor", description: "Agents in action, from research labs and companies." },
    { title: "Industry kiosks", icon: "store", description: "Meet companies showcasing agentic technology." },
    { title: "Hackathon", icon: "trophy", description: "One hackathon, one track, one question, with the finals at the workshop." },
  ],
  themes: [
    {
      key: "healthcare",
      title: "Agentic AI in Healthcare",
      description:
        "Agents that support clinicians and patients by triaging, summarising records, coordinating care and accelerating diagnostics, built to be safe, fair and accountable.",
    },
    {
      key: "science",
      title: "Agentic AI for Scientific Discovery",
      description:
        "AI scientists that read the literature, generate hypotheses, design and run experiments and analyse results, closing the loop from idea to insight.",
    },
    {
      key: "enterprise",
      title: "Agentic AI and Enterprise",
      description:
        "From prototype to product: building, funding and scaling agentic AI ventures, and the new business models that agents make possible.",
    },
  ],

  programmeStatus: "tba",
  programmeNote:
    "The detailed programme will be published soon. Sessions span invited talks, panel discussions, tutorials, live demos and the hackathon final.",
  schedulePdf: "",

  mapQuery: "Indian Institute of Technology Delhi, Hauz Khas, New Delhi",
  mapEmbedUrl: "",
  directions: [
    {
      mode: "air",
      title: "From the airport",
      details:
        "Indira Gandhi International Airport (DEL) is roughly 15 km from campus, about 30–60 minutes by taxi depending on traffic. Prepaid taxis and app-based cabs are available at every terminal. The Magenta Line metro (from Terminal 1) and the Airport Express Line (from Terminal 3) connect to the city network.",
    },
    {
      mode: "rail",
      title: "From the railway stations",
      details:
        "New Delhi and Hazrat Nizamuddin stations are roughly 12–16 km away (about 40–60 minutes by taxi). From New Delhi station, the Yellow Line metro runs directly to Hauz Khas.",
    },
    {
      mode: "metro",
      title: "By Delhi Metro",
      details:
        "The nearest stations are IIT (Magenta Line) and Hauz Khas (Yellow and Magenta Lines). From there, the campus is a short auto-rickshaw or cab ride. Use the DMRC journey planner for the best route.",
    },
    {
      mode: "road",
      title: "By road",
      details:
        "IIT Delhi is in Hauz Khas, South Delhi. App-based cabs and auto-rickshaws are widely available; allow extra time during peak hours. Visitor parking on campus is limited.",
    },
  ],
  campusEntry:
    "IIT Delhi is a secured campus. Please carry a valid government-issued photo ID and your registration ID (sent to you by e-mail). The exact hall, entry gate and any visitor-pass details will be shared here and by e-mail before the workshop.",
  accommodation: [
    { name: "IIT Delhi guest house", kind: "campus", distance: "On campus", url: "", note: "Limited rooms may be available for speakers and outstation participants on request. Contact the organisers." },
    { name: "Hauz Khas, Green Park & Safdarjung Enclave", kind: "area", distance: "2–5 km", url: "", note: "Many hotels and guest houses within a short cab or metro ride." },
    { name: "Saket & Malviya Nagar", kind: "area", distance: "3–6 km", url: "", note: "Mid-range hotels, restaurants and malls on the Yellow Line metro." },
    { name: "Aerocity", kind: "area", distance: "~15 km", url: "", note: "Business hotels next to the airport, convenient for short visits." },
  ],
  localInfo: [
    "December in Delhi is cool, with chilly mornings and evenings. Pack a light jacket.",
    "Air quality can be poor in winter; carry a mask if you are sensitive to pollution.",
    "App-based cabs and the Delhi Metro are the easiest ways to get around.",
    "Hauz Khas Village, Deer Park and the Qutub Minar are a short ride from campus.",
  ],

  sponsorshipIntro:
    "Partner with the Agentic AI Workshop 2026 to engage with leading researchers, students, startups and industry teams working on agentic AI. Sponsorship and exhibition packages can be tailored to your goals.",
  sponsorTiers: [
    {
      name: "Title partner",
      price: "On request",
      perks: ["Prominent branding across the venue and website", "Speaking slot in the opening session", "Premium kiosk space", "Hackathon sponsorship"],
    },
    {
      name: "Platinum",
      price: "On request",
      perks: ["Logo on the website, banners and schedule", "Kiosk space at the venue", "Access to hackathon talent"],
    },
    { name: "Gold", price: "On request", perks: ["Logo on the website and banners", "Kiosk space in the shared zone"] },
    { name: "Academic & community partners", price: "On request", perks: ["Logo on the website", "Outreach to your community"] },
  ],
  sponsorBrochure: "",
  kioskIntro:
    "Industry kiosks give companies and startups a space to showcase agentic AI products, research prototypes and career opportunities to a highly engaged audience.",

  contactEmail: "",
  contactPhone: "",
  notifyEmail: "",
  website: "",
  linkedin: "",
  x: "",
  instagram: "",
  youtube: "",

  logoIITD: "",
  logoScAI: "",
  eventLogo: "",
  brandColor: "",
  palette: { azure: "", lilac: "", mint: "", peach: "", blush: "", butter: "", aqua: "" },
  ogImage: "",

  showMoreSpeakers: true,
  showAssistant: true,
  showGallery: false,
  showTalks: false,
  showWinners: false,
  bannerText: "",
  bannerLink: "",

  gaId: "",
  keywords: [
    "Agentic AI",
    "AI agents",
    "IIT Delhi",
    "Yardi School of Artificial Intelligence",
    "ScAI",
    "workshop",
    "hackathon",
    "AI in healthcare",
    "AI for science",
    "AI in enterprise",
  ],
};

export const DEFAULT_HACKATHON: HackathonInfo = {
  title: "Agentic AI Hackathon 2026",
  tagline: "One track, one question: build the agent that answers it.",
  overview:
    "One hackathon, one track, one question: every team designs and builds an agentic AI system that answers the same question, with one timeline, one set of rules and one prize pool. After the idea round, shortlisted teams compete in the **final round live at the workshop** at IIT Delhi on 15–16 December 2026.",
  mode: "To be announced (on-site / hybrid)",
  teamSize: "To be announced",
  teamType: "Students, researchers and early-career professionals; teams may mix institutions",
  dates: "",
  location: "",
  prizePool: "TBA",
  eligibility: [
    "Open to students, researchers and early-career professionals. Final eligibility rules will be announced.",
    "Teams may include members from different institutions.",
    "Each participant can be part of only one team.",
  ],
  registrationNote: "Registration is per team: one member registers on behalf of the whole team.",
  question: "What can agents do for us?",
  challenge:
    "Pick a real task, from any field, and build an agent that plans, uses tools and acts on it, safely and with people in the loop. The full problem statement is published when registration opens.",
  ideas: [
    "Hand a slow, multi-step task that people do by hand today to an agent, with a person signing off",
    "Build an agent that plans, uses real tools and APIs, and explains each step it takes",
    "Make agents work together: split a job, check each other's work and report back",
  ],
  rules: [
    "Build during the hackathon; existing open-source libraries, models and APIs are allowed with attribution.",
    "AI coding assistants are allowed but must be disclosed in your submission.",
    "Submissions include source code (e.g. a GitHub repository), a short demo video and a README.",
    "Do not use real personal or patient data without the appropriate permissions.",
    "Detailed rules will be published when registration opens. The judges' decisions are final.",
  ],
  codeOfConduct:
    "We are committed to a respectful, harassment-free and inclusive experience for everyone. Be kind, collaborate generously and report any concerns to the organisers. Participants who violate the code of conduct may be disqualified.",
  timeline: [
    { label: "Registration opens", date: "", dateLabel: "TBA", description: "Form your team and register." },
    { label: "Registration closes", date: "", dateLabel: "TBA", description: "Last date to register your team." },
    { label: "Idea submission", date: "", dateLabel: "TBA", description: "Submit a short proposal for your agent." },
    { label: "Shortlisting", date: "", dateLabel: "TBA", description: "Shortlisted teams are announced." },
    { label: "Final round at the workshop", date: "2026-12-15", dateLabel: "15–16 Dec 2026", description: "Build, demo and pitch live at IIT Delhi." },
    { label: "Results", date: "", dateLabel: "TBA", description: "Winners announced." },
  ],
  prizes: [
    { place: "Winner", reward: "TBA", description: "" },
    { place: "Runner-up", reward: "TBA", description: "" },
    { place: "Second runner-up", reward: "TBA", description: "" },
    { place: "Special mention", reward: "TBA", description: "" },
  ],
  judgingCriteria: [
    { name: "Impact & relevance", weight: 25, description: "Does it answer the question for a real problem and real people?" },
    { name: "Agentic design & technical depth", weight: 25, description: "Planning, tool use, memory and robustness of the agent." },
    { name: "Innovation", weight: 20, description: "Novelty of the idea and the approach." },
    { name: "Demo & user experience", weight: 20, description: "A working demo that is clear and usable." },
    { name: "Responsible AI", weight: 10, description: "Safety, privacy, fairness and transparency considerations." },
  ],
  resultsNote: "Congratulations to all the teams who took part!",
  winners: [],
};

type NewDoc<T> = Omit<T, "id">;

export const DEFAULT_PEOPLE: NewDoc<Person>[] = [
  ...["Prof. Sandeep Kumar", "Prof. Mausam", "Prof. Parag Singla", "Prof. Tanmoy Chakraborty", "Prof. Souvik Chakraborty"].map(
    (name, i) => ({
      name,
      group: "faculty" as const,
      role: "Faculty organiser",
      department: "",
      affiliation: "IIT Delhi",
      profileUrl: "",
      photo: "",
      bio: "",
      order: i + 1,
      published: true,
    }),
  ),
  { name: "Abhishek Gupta", group: "student", role: "PhD scholar", department: "Yardi School of Artificial Intelligence (ScAI)", affiliation: "IIT Delhi", profileUrl: "", photo: "", bio: "", order: 1, published: true },
  { name: "Aditya Shahne", group: "student", role: "PhD scholar", department: "Department of Electrical Engineering", affiliation: "IIT Delhi", profileUrl: "", photo: "", bio: "", order: 2, published: true },
  { name: "Ajit Kumar Singh", group: "student", role: "PhD scholar", department: "Department of Electrical Engineering", affiliation: "IIT Delhi", profileUrl: "", photo: "", bio: "", order: 3, published: true },
];

export const DEFAULT_FAQS: NewDoc<Faq>[] = [
  { category: "general", question: "Who can attend the workshop?", answer: "The workshop is open to researchers, faculty, students, industry practitioners, startups and investors interested in agentic AI. Registration is required." },
  { category: "registration", question: "Is there a registration fee?", answer: "Fee details (if any) will be announced on the Registration page. Register early: seats may be limited." },
  { category: "registration", question: "Do I need to register separately for the hackathon?", answer: "Yes. Workshop registration and hackathon registration are separate. Hackathon registration is done per team on the Hackathon page." },
  { category: "programme", question: "When will the detailed programme be available?", answer: "The schedule is published on the Programme page as sessions are confirmed. You can download it as a PDF and add sessions to your calendar." },
  { category: "programme", question: "What should I bring to the tutorials?", answer: "Most tutorials need a laptop. Check each tutorial's prerequisites (software, accounts) on the Tutorials & Demos page." },
  { category: "programme", question: "Will the talks be recorded?", answer: "Selected talk slides and recordings may be shared on this website after the event." },
  { category: "travel", question: "How do I reach IIT Delhi?", answer: "See the Venue & travel page for directions from the airport, the railway stations and the Delhi Metro, and the route map on the home page." },
  { category: "travel", question: "Is accommodation provided?", answer: "Accommodation is not included in registration unless announced otherwise. The Venue & travel page lists nearby options." },
  { category: "sponsorship", question: "How can my company exhibit or sponsor?", answer: "Use the “Exhibit with us” or “Become a partner” forms on this page, or e-mail the organisers, and we will share the available options." },
  { category: "hackathon", question: "What is the hackathon team size?", answer: "Team size and eligibility will be announced with the detailed rules. Keep an eye on the Hackathon page for updates." },
  { category: "hackathon", question: "Where does the hackathon final take place?", answer: "The final round takes place live at the workshop at IIT Delhi on 15–16 December 2026." },
].map((f, i) => ({ ...f, order: i + 1, published: true }));

/** Earlier default About point sets. Stored but never edited, they are replaced by the current topics. */
const RETIRED_ABOUT_POINTS = [
  "Agents that act|Three themes|Talks and panels|Learn by doing|Build and compete|Open to all",
  "What is agentic AI?|When and where?|Why now?|Which themes?|Who is speaking?|Can I get hands-on?|Is there a hackathon?|Industry presence?|Who should come?|Who organises it?",
];

function withCurrentAboutPoints<T extends { aboutPoints?: { title: string }[] }>(settings: T): T {
  const titles = settings.aboutPoints?.map((p) => p.title).join("|");
  return titles && RETIRED_ABOUT_POINTS.includes(titles) ? { ...settings, aboutPoints: DEFAULT_SETTINGS.aboutPoints } : settings;
}

/*
 * Earlier defaults. A site stores the defaults of its day when it is set up, so these are still in the
 * databases of sites set up before the defaults changed (the third theme was Entrepreneurship, now
 * Enterprise; the hackathon had a track per theme, now one track and one question; the home page
 * opened with the highlights and announcements). As they are read, a stored value that is still one of
 * these, never edited, becomes the current default; anything an organiser has changed is kept. The
 * database itself is not changed.
 */
interface Retired {
  /** By field, or "section.text" for a section's texts: earlier defaults, each replaced by the current default there. */
  values: Record<string, unknown[]>;
  /** By list: earlier default texts inside its items (or the list's own strings), each with the text that replaces it. */
  texts: Record<string, Record<string, string>>;
}

const RETIRED: { settings: Retired; hackathon: Retired } = {
  settings: {
    values: {
      tagline: ["Where autonomous AI agents meet healthcare, science and entrepreneurship."],
      motivation: [
        "AI systems are moving from answering questions to **taking actions**: planning multi-step tasks, using tools, collaborating with people and other agents, and learning from feedback. This shift opens remarkable opportunities and raises hard questions about reliability, safety and accountability.\n\nThe Agentic AI Workshop 2026 brings together researchers, practitioners, founders and investors at IIT Delhi to take stock of where agentic AI stands, where it is heading, and how it can create real impact in **healthcare**, **scientific discovery** and **entrepreneurship**.",
      ],
      homeOrder: [["highlights", "news", "themes", "about", "speakers", "hackathon", "venue", "partners", "faq"]],
      "siteNav.hackathonText": ["One hackathon on three themes, with team registration"],
      "siteNav.themesText": ["Healthcare, scientific discovery and entrepreneurship"],
      "homeThemes.description": ["Talks, tutorials and the hackathon are organised around three themes."],
      "hackathonTracks.eyebrow": ["Themes"],
      "hackathonTracks.title": ["One hackathon, three themes"],
      "hackathonTracks.description": [
        "Every team takes part in the same hackathon, with one timeline, one set of rules and one prize pool. Pick the theme your idea fits; the problems below are examples to get you thinking.",
      ],
      "hackathonTracks.frame": ["One hackathon · {count} themes"],
      "hackathonPrizes.intro": ["Prizes for the top three teams, and awards for the best agent in each theme."],
      "hackathonRegisterForm.need1": ["A team name and a theme"],
      "hackathonRegisterForm.tracksLink": ["Not sure which theme? See the themes"],
      "hackathonRegisterForm.soonText": [
        "Start forming your team! When registration opens you will need a team name, the theme you'll work on, member details and a short idea summary.",
      ],
    },
    texts: {
      themes: { entrepreneurship: "enterprise", "Agentic AI and Entrepreneurship": "Agentic AI and Enterprise" },
      aboutPoints: {
        "Healthcare, scientific discovery and entrepreneurship: where agents can create real impact.": "Healthcare, scientific discovery and enterprise: where agents can create real impact.",
        "Teams build agents for health, science or startups, with the finals live at the workshop.": "One track and one question for every team, with the finals live at the workshop.",
      },
      activities: { "Build agents for health, science and startups, with the finals at the workshop.": "One hackathon, one track, one question, with the finals at the workshop." },
      sponsorTiers: { "Hackathon theme sponsorship": "Hackathon sponsorship" },
      keywords: { "AI entrepreneurship": "AI in enterprise" },
    },
  },
  hackathon: {
    values: {
      tagline: ["Build agents that matter for health, science and startups."],
      overview: [
        "One hackathon, three themes: teams design and build agentic AI systems that tackle real problems in healthcare, scientific discovery or entrepreneurship. After the idea round, shortlisted teams compete in the **final round live at the workshop** at IIT Delhi on 15–16 December 2026.",
      ],
    },
    texts: {
      prizes: { "Best agent in each theme": "Special mention" },
      judgingCriteria: { "Does it address a real problem in one of the themes?": "Does it answer the question for a real problem and real people?" },
    },
  },
};

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function withoutRetired<T extends object>(data: T, defaults: T, { values, texts }: Retired): T {
  const out = { ...data } as Record<string, unknown>;
  const def = defaults as Record<string, unknown>;
  for (const [path, was] of Object.entries(values)) {
    const [key, name] = path.split(".");
    const group = out[key] as Record<string, unknown> | undefined;
    if (name === undefined) {
      if (was.some((w) => same(w, out[key]))) out[key] = def[key];
    } else if (group && typeof group === "object" && was.some((w) => same(w, group[name]))) {
      out[key] = { ...group, [name]: (def[key] as Record<string, unknown>)[name] };
    }
  }
  for (const [key, swaps] of Object.entries(texts)) {
    const swap = (v: unknown): unknown =>
      typeof v === "string"
        ? (Object.hasOwn(swaps, v) ? swaps[v] : v)
        : Array.isArray(v)
          ? v.map(swap)
          : v && typeof v === "object"
            ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, swap(x)]))
            : v;
    if (Array.isArray(out[key])) out[key] = swap(out[key]);
  }
  return out as T;
}

/** Each form's fields made whole (src/lib/forms.ts), as they are read. */
function withWholeForms<T extends object>(settings: T): T {
  const out = { ...settings } as Record<string, unknown>;
  for (const form of Object.keys(FORM_SETTINGS) as FormKey[]) out[FORM_SETTINGS[form]] = formFields(form, out[FORM_SETTINGS[form]]);
  return out as T;
}

/**
 * Stored settings or hackathon details (merged over the defaults) with any earlier, unedited default replaced
 * by the current one, and the forms' fields made whole.
 */
export function withCurrentDefaults<T extends object>(key: "settings" | "hackathon", data: T): T {
  if (key === "hackathon") return withoutRetired(data, DEFAULT_HACKATHON as T, RETIRED.hackathon);
  return withWholeForms(withoutRetired(withCurrentAboutPoints(data as T & { aboutPoints?: { title: string }[] }), DEFAULT_SETTINGS as T, RETIRED.settings));
}
