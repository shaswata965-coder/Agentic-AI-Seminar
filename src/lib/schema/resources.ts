import {
  ATTENDEE_CATEGORIES,
  FAQ_CATEGORIES,
  FAQ_CATEGORY_META,
  LEVEL_META,
  LEVELS,
  opts,
  PEOPLE_GROUP_META,
  PEOPLE_GROUPS,
  PROGRAMME_STATUSES,
  REGISTRATION_STATUSES,
  SESSION_TYPE_META,
  SESSION_TYPES,
  SPEAKER_CATEGORIES,
  SPEAKER_CATEGORY_META,
  SPONSOR_TIER_META,
  SPONSOR_TIERS,
  THEME_KEYS,
  THEME_META,
} from "@/lib/content/constants";
import {
  bool,
  color,
  datetime,
  date,
  email,
  file,
  image,
  list,
  num,
  objects,
  ref,
  refList,
  richtext,
  select,
  text,
  textarea,
  time,
  url,
  type FieldDef,
  type FieldSection,
} from "./fields";

export const themeOptions = opts(THEME_KEYS, (k) => THEME_META[k].short);
const dayOptions = [
  { value: "1", label: "Day 1 — Tue 15 Dec" },
  { value: "2", label: "Day 2 — Wed 16 Dec" },
];
const published = bool("published", "Published (visible on the website)");
const order = num("order", "Display order", { help: "Lower numbers appear first.", width: "third" });

export type AdminIcon =
  | "megaphone"
  | "mic"
  | "calendar"
  | "graduation"
  | "monitor"
  | "store"
  | "handshake"
  | "users"
  | "help"
  | "image"
  | "video";

export interface Column {
  key: string;
  label: string;
  kind?: "text" | "boolean" | "date" | "image" | "option";
}

export interface CollectionDef {
  key: string;
  model: string;
  label: string;
  singular: string;
  description: string;
  icon: AdminIcon;
  group: "Content" | "Programme" | "People" | "Post-event";
  fields: FieldDef[];
  columns: Column[];
  sort: Record<string, 1 | -1>;
  titleKey: string;
  tags: string[];
  slugFrom?: string;
  publicPath?: string;
  defaults?: Record<string, unknown>;
}

export const COLLECTIONS: CollectionDef[] = [
  {
    key: "announcements",
    model: "Announcement",
    label: "Announcements",
    singular: "Announcement",
    description: "News shown in the Announcements box on the home page. Pinned items stay on top.",
    icon: "megaphone",
    group: "Content",
    titleKey: "title",
    tags: ["announcements"],
    publicPath: "/#news",
    sort: { pinned: -1, date: -1 },
    defaults: { published: true, pinned: false, tone: "info" },
    columns: [
      { key: "title", label: "Title" },
      { key: "date", label: "Date", kind: "date" },
      { key: "pinned", label: "Pinned", kind: "boolean" },
      { key: "published", label: "Published", kind: "boolean" },
    ],
    fields: [
      text("title", "Title", { required: true, maxLength: 140 }),
      textarea("body", "Message", { maxLength: 1200, rows: 4 }),
      datetime("date", "Date", { required: true, width: "half", help: "Indian Standard Time." }),
      select("tone", "Style", [
        { value: "info", label: "Information" },
        { value: "important", label: "Important" },
        { value: "success", label: "Good news" },
      ], { width: "half" }),
      url("linkUrl", "Link (optional)", { width: "half" }),
      text("linkLabel", "Link text", { width: "half", placeholder: "Read more" }),
      bool("pinned", "Pin to the top"),
      published,
    ],
  },
  {
    key: "speakers",
    model: "Speaker",
    label: "Speakers",
    singular: "Speaker",
    description: "Academic and industry speakers and panelists. Their cards appear on the Speakers page; featured speakers also appear on the home page.",
    icon: "mic",
    group: "Programme",
    titleKey: "name",
    slugFrom: "name",
    tags: ["speakers"],
    publicPath: "/speakers",
    sort: { order: 1, name: 1 },
    defaults: { published: true, featured: false, category: "academia", order: 100 },
    columns: [
      { key: "photo", label: "", kind: "image" },
      { key: "name", label: "Name" },
      { key: "affiliation", label: "Affiliation" },
      { key: "category", label: "Label", kind: "option" },
      { key: "featured", label: "Home", kind: "boolean" },
      { key: "published", label: "Published", kind: "boolean" },
    ],
    fields: [
      text("name", "Full name", { required: true, width: "half" }),
      text("slug", "URL slug", { width: "half", help: "Leave blank to generate from the name." }),
      text("designation", "Designation", { width: "half", placeholder: "Professor of Computer Science" }),
      text("affiliation", "Affiliation", { width: "half", placeholder: "IIT Delhi" }),
      select("category", "Label", opts(SPEAKER_CATEGORIES, (k) => SPEAKER_CATEGORY_META[k].label), { required: true, width: "third" }),
      select("theme", "Theme", themeOptions, { width: "third" }),
      bool("keynote", "Keynote speaker", { width: "third" }),
      image("photo", "Photo", { help: "Square photos look best. Uploads are compressed automatically." }),
      richtext("bio", "Bio"),
      text("talkTitle", "Talk title"),
      richtext("talkAbstract", "Talk abstract"),
      url("website", "Website", { width: "half" }),
      url("linkedin", "LinkedIn", { width: "half" }),
      url("x", "X / Twitter", { width: "half" }),
      url("scholar", "Google Scholar", { width: "half" }),
      url("github", "GitHub", { width: "half" }),
      bool("featured", "Feature on the home page"),
      order,
      published,
    ],
  },
  {
    key: "sessions",
    model: "Session",
    label: "Programme",
    singular: "Session",
    description: "Day-wise schedule. Set the programme status (TBA / draft / final) in Settings → Programme.",
    icon: "calendar",
    group: "Programme",
    titleKey: "title",
    tags: ["sessions"],
    publicPath: "/programme",
    sort: { day: 1, start: 1, order: 1 },
    defaults: { published: true, day: "1", type: "talk", theme: "general", order: 0 },
    columns: [
      { key: "day", label: "Day", kind: "option" },
      { key: "start", label: "Start" },
      { key: "title", label: "Title" },
      { key: "type", label: "Type", kind: "option" },
      { key: "theme", label: "Theme", kind: "option" },
      { key: "published", label: "Published", kind: "boolean" },
    ],
    fields: [
      text("title", "Session title", { required: true }),
      select("day", "Day", dayOptions, { required: true, width: "third" }),
      time("start", "Start time", { required: true, width: "third" }),
      time("end", "End time", { width: "third" }),
      select("type", "Type", opts(SESSION_TYPES, (k) => SESSION_TYPE_META[k].label), { required: true, width: "half" }),
      select("theme", "Theme", themeOptions, { width: "half" }),
      text("room", "Room / hall", { width: "half", placeholder: "To be announced" }),
      text("speakerNote", "Speaker text", { width: "half", help: "Shown when no speaker is linked, e.g. “Speaker to be announced”." }),
      refList("speakers", "Speakers / instructors", "speakers"),
      ref("moderator", "Moderator (panels)", "speakers", { width: "half" }),
      refList("panelists", "Panelists (panels)", "speakers"),
      richtext("description", "Description"),
      order,
      published,
    ],
  },
  {
    key: "tutorials",
    model: "Tutorial",
    label: "Tutorials",
    singular: "Tutorial",
    description: "Hands-on tutorials with instructors, prerequisites and material links.",
    icon: "graduation",
    group: "Programme",
    titleKey: "title",
    slugFrom: "title",
    tags: ["tutorials"],
    publicPath: "/tutorials",
    sort: { order: 1, title: 1 },
    defaults: { published: true, level: "all", theme: "general", order: 100 },
    columns: [
      { key: "title", label: "Title" },
      { key: "level", label: "Level", kind: "option" },
      { key: "theme", label: "Theme", kind: "option" },
      { key: "published", label: "Published", kind: "boolean" },
    ],
    fields: [
      text("title", "Title", { required: true }),
      text("slug", "URL slug", { width: "half", help: "Leave blank to generate from the title." }),
      text("schedule", "When & where", { width: "half", placeholder: "Day 1 · 14:00–15:30 · Room TBA" }),
      select("level", "Level", opts(LEVELS, (k) => LEVEL_META[k].label), { width: "third" }),
      text("duration", "Duration", { width: "third", placeholder: "90 minutes" }),
      select("theme", "Theme", themeOptions, { width: "third" }),
      objects("instructors", "Instructors", "Instructor", [
        text("name", "Name", { required: true, width: "half" }),
        text("affiliation", "Affiliation", { width: "half" }),
        url("url", "Profile link"),
      ]),
      richtext("description", "Description"),
      list("prerequisites", "Prerequisites", { itemLabel: "Prerequisite", help: "Laptop, software, accounts…" }),
      objects("materials", "Materials & links", "Link", [
        text("label", "Label", { required: true, width: "half", placeholder: "GitHub repository" }),
        url("url", "URL", { required: true, width: "half" }),
      ]),
      text("capacity", "Seats / capacity", { width: "half" }),
      order,
      published,
    ],
  },
  {
    key: "demos",
    model: "Demo",
    label: "Demos",
    singular: "Demo",
    description: "Live demos shown on the Tutorials & Demos page.",
    icon: "monitor",
    group: "Programme",
    titleKey: "title",
    tags: ["demos"],
    publicPath: "/tutorials#demos",
    sort: { order: 1, title: 1 },
    defaults: { published: true, theme: "general", order: 100 },
    columns: [
      { key: "image", label: "", kind: "image" },
      { key: "title", label: "Title" },
      { key: "team", label: "Team / company" },
      { key: "published", label: "Published", kind: "boolean" },
    ],
    fields: [
      text("title", "Title", { required: true }),
      text("team", "Team / company", { width: "half" }),
      select("theme", "Theme", themeOptions, { width: "half" }),
      textarea("description", "Short description", { maxLength: 600 }),
      image("image", "Image"),
      url("videoUrl", "Video link (YouTube / Vimeo)", { width: "half" }),
      url("link", "Project link", { width: "half" }),
      order,
      published,
    ],
  },
  {
    key: "kiosks",
    model: "Kiosk",
    label: "Industry kiosks",
    singular: "Kiosk",
    description: "Participating companies and the agentic technology they showcase.",
    icon: "store",
    group: "Content",
    titleKey: "company",
    tags: ["kiosks"],
    publicPath: "/#kiosks",
    sort: { order: 1, company: 1 },
    defaults: { published: true, order: 100 },
    columns: [
      { key: "logo", label: "", kind: "image" },
      { key: "company", label: "Company" },
      { key: "booth", label: "Booth" },
      { key: "published", label: "Published", kind: "boolean" },
    ],
    fields: [
      text("company", "Company name", { required: true, width: "half" }),
      text("booth", "Booth number", { width: "half" }),
      image("logo", "Logo"),
      textarea("description", "What they showcase", { maxLength: 500 }),
      url("website", "Website", { width: "half" }),
      select("theme", "Theme", themeOptions, { width: "half" }),
      order,
      published,
    ],
  },
  {
    key: "sponsors",
    model: "Sponsor",
    label: "Partners & sponsors",
    singular: "Partner",
    description: "Logo wall grouped by tier. Sponsorship tiers and the enquiry text live in Settings → Partners.",
    icon: "handshake",
    group: "Content",
    titleKey: "name",
    tags: ["sponsors"],
    publicPath: "/#partners",
    sort: { order: 1, name: 1 },
    defaults: { published: true, tier: "partner", order: 100 },
    columns: [
      { key: "logo", label: "", kind: "image" },
      { key: "name", label: "Name" },
      { key: "tier", label: "Tier", kind: "option" },
      { key: "published", label: "Published", kind: "boolean" },
    ],
    fields: [
      text("name", "Name", { required: true, width: "half" }),
      select("tier", "Tier", opts(SPONSOR_TIERS, (k) => SPONSOR_TIER_META[k].label), { required: true, width: "half" }),
      image("logo", "Logo", { help: "Transparent PNG or SVG works best." }),
      url("website", "Website"),
      textarea("blurb", "Short description (optional)", { maxLength: 300 }),
      order,
      published,
    ],
  },
  {
    key: "people",
    model: "Person",
    label: "Organisers & volunteers",
    singular: "Person",
    description: "Faculty and student organisers, volunteers, hackathon mentors and judges. All use the same card style.",
    icon: "users",
    group: "People",
    titleKey: "name",
    tags: ["people"],
    publicPath: "/organisers",
    sort: { group: 1, order: 1, name: 1 },
    defaults: { published: true, group: "volunteer", affiliation: "IIT Delhi", order: 100 },
    columns: [
      { key: "photo", label: "", kind: "image" },
      { key: "name", label: "Name" },
      { key: "group", label: "Group", kind: "option" },
      { key: "role", label: "Role" },
      { key: "published", label: "Published", kind: "boolean" },
    ],
    fields: [
      text("name", "Full name", { required: true, width: "half" }),
      select("group", "Group", opts(PEOPLE_GROUPS, (k) => PEOPLE_GROUP_META[k].label), { required: true, width: "half" }),
      text("role", "Role", { width: "half", placeholder: "PhD scholar, ScAI" }),
      text("department", "Department", { width: "half" }),
      text("affiliation", "Affiliation", { width: "half" }),
      url("profileUrl", "Profile page", { width: "half" }),
      image("photo", "Photo"),
      textarea("bio", "Short bio (mentors & judges)", { maxLength: 600 }),
      order,
      published,
    ],
  },
  {
    key: "faqs",
    model: "Faq",
    label: "FAQs",
    singular: "Question",
    description: "Frequently asked questions. Hackathon questions also appear on the Hackathon page.",
    icon: "help",
    group: "Content",
    titleKey: "question",
    tags: ["faqs"],
    publicPath: "/#faq",
    sort: { order: 1 },
    defaults: { published: true, category: "general", order: 100 },
    columns: [
      { key: "question", label: "Question" },
      { key: "category", label: "Category", kind: "option" },
      { key: "published", label: "Published", kind: "boolean" },
    ],
    fields: [
      text("question", "Question", { required: true }),
      richtext("answer", "Answer", { required: true }),
      select("category", "Category", opts(FAQ_CATEGORIES, (k) => FAQ_CATEGORY_META[k]), { width: "half" }),
      order,
      published,
    ],
  },
  {
    key: "gallery",
    model: "GalleryItem",
    label: "Photo gallery",
    singular: "Photo",
    description: "Post-event photos. Turn the gallery on in Settings → Features when ready.",
    icon: "image",
    group: "Post-event",
    titleKey: "caption",
    tags: ["gallery"],
    publicPath: "/gallery",
    sort: { order: 1, createdAt: -1 },
    defaults: { published: true, order: 100 },
    columns: [
      { key: "image", label: "", kind: "image" },
      { key: "caption", label: "Caption" },
      { key: "day", label: "Day", kind: "option" },
      { key: "published", label: "Published", kind: "boolean" },
    ],
    fields: [
      image("image", "Photo", { required: true }),
      text("caption", "Caption"),
      text("alt", "Alt text (describe the photo)", { help: "Helps visitors using screen readers." }),
      select("day", "Day", [...dayOptions, { value: "other", label: "Other" }], { width: "half" }),
      order,
      published,
    ],
  },
  {
    key: "talks",
    model: "Talk",
    label: "Slides & recordings",
    singular: "Recording",
    description: "Post-event talk slides and recordings. Turn this section on in Settings → Features.",
    icon: "video",
    group: "Post-event",
    titleKey: "title",
    tags: ["talks"],
    publicPath: "/talks",
    sort: { order: 1, title: 1 },
    defaults: { published: true, order: 100 },
    columns: [
      { key: "title", label: "Title" },
      { key: "speakerName", label: "Speaker" },
      { key: "published", label: "Published", kind: "boolean" },
    ],
    fields: [
      text("title", "Talk title", { required: true }),
      text("speakerName", "Speaker(s)", { width: "half" }),
      select("day", "Day", dayOptions, { width: "half" }),
      textarea("description", "Description"),
      file("slides", "Slides (PDF upload or link)"),
      url("videoUrl", "Recording link (YouTube / Vimeo)"),
      order,
      published,
    ],
  },
];

export const COLLECTION_MAP: Record<string, CollectionDef> = Object.fromEntries(COLLECTIONS.map((c) => [c.key, c]));

/* -------------------------------------------------------------- Singletons -- */

const iconOptions = [
  { value: "mic", label: "Microphone" },
  { value: "graduation", label: "Graduation cap" },
  { value: "monitor", label: "Screen" },
  { value: "store", label: "Kiosk" },
  { value: "trophy", label: "Trophy" },
  { value: "users", label: "People" },
  { value: "calendar", label: "Calendar" },
  { value: "sparkles", label: "Sparkles" },
  { value: "flask", label: "Flask" },
  { value: "briefcase", label: "Briefcase" },
  { value: "rocket", label: "Rocket" },
  { value: "code", label: "Code" },
  { value: "landmark", label: "Institution" },
  { value: "heart", label: "Heart" },
];

export interface SingletonDef {
  key: "settings" | "hackathon";
  label: string;
  description: string;
  tags: string[];
  sections: FieldSection[];
}

export const SETTINGS_DEF: SingletonDef = {
  key: "settings",
  label: "Site settings",
  description: "Event details, registration, venue, branding and feature switches.",
  tags: ["settings"],
  sections: [
    {
      key: "general",
      title: "Event details",
      fields: [
        text("eventName", "Event name", { required: true, width: "half" }),
        text("shortName", "Short name", { width: "half" }),
        text("tagline", "Tagline"),
        textarea("description", "Short description", { help: "Used for search engines and social media previews.", maxLength: 300 }),
        text("organisedBy", "Organised by"),
        datetime("startDate", "Starts", { required: true, width: "half", help: "Indian Standard Time. The countdown counts down to this." }),
        datetime("endDate", "Ends", { required: true, width: "half" }),
        text("venueName", "Venue", { width: "half" }),
        text("venueHall", "Hall / building", { width: "half", help: "Leave blank to show “to be announced”." }),
        textarea("venueAddress", "Full address", { rows: 2 }),
        text("heroNote", "Hero badge text", { placeholder: "Registrations opening soon", help: "Small badge above the title on the home page." }),
      ],
    },
    {
      key: "registration",
      title: "Registration",
      description: "Use the built-in forms, or paste a link to an external form (Google Forms, Unstop, Devfolio…).",
      fields: [
        select("workshopStatus", "Workshop registration", [
          { value: "soon", label: "Opening soon" },
          { value: "open", label: "Open" },
          { value: "closed", label: "Closed" },
        ], { width: "half" }),
        datetime("workshopDeadline", "Workshop registration deadline", { width: "half" }),
        url("workshopUrl", "External workshop form (optional)", { help: "Leave blank to use the built-in registration form." }),
        objects("fees", "Fees", "Fee", [
          text("category", "Category", { required: true, width: "half", placeholder: "Students" }),
          text("amount", "Amount", { width: "half", placeholder: "To be announced" }),
          text("note", "Note"),
        ]),
        textarea("feeNote", "Fee note", { placeholder: "Fee details will be announced soon." }),
        textarea("confirmationNote", "Extra text for the confirmation e-mail"),
        select("hackathonStatus", "Hackathon registration", [
          { value: "soon", label: "Opening soon" },
          { value: "open", label: "Open" },
          { value: "closed", label: "Closed" },
        ], { width: "half" }),
        datetime("hackathonDeadline", "Hackathon registration deadline", { width: "half" }),
        url("hackathonUrl", "External hackathon platform link (optional)", { width: "half", help: "e.g. Unstop or Devfolio. Leave blank for the built-in form." }),
        text("hackathonPlatform", "Platform name", { width: "half", placeholder: "Unstop" }),
      ],
    },
    {
      key: "home",
      title: "Home page",
      fields: [
        objects("highlights", "Highlight strip", "Highlight", [
          text("label", "Label", { required: true, width: "third" }),
          text("value", "Value", { width: "third", placeholder: "TBA" }),
          select("icon", "Icon", iconOptions, { width: "third" }),
        ], { maxItems: 6 }),
        bool("showCountdown", "Show the countdown timer"),
        num("featuredSpeakers", "Featured speakers on the home page", { min: 0, max: 12, width: "half" }),
      ],
    },
    {
      key: "about",
      title: "About & themes",
      fields: [
        richtext("motivation", "Workshop motivation"),
        richtext("agenticAI", "What is agentic AI?"),
        objects("audience", "Who should attend", "Audience", [
          text("title", "Title", { required: true, width: "half" }),
          select("icon", "Icon", iconOptions, { width: "half" }),
          textarea("description", "Description", { rows: 2 }),
        ]),
        objects("activities", "Activities", "Activity", [
          text("title", "Title", { required: true, width: "half" }),
          select("icon", "Icon", iconOptions, { width: "half" }),
          textarea("description", "Description", { rows: 2 }),
        ]),
        objects("themes", "Themes", "Theme", [
          select("key", "Theme", themeOptions.filter((t) => t.value !== "general"), { required: true, width: "half" }),
          text("title", "Title", { required: true, width: "half" }),
          textarea("description", "Description (2–3 lines)", { rows: 3 }),
        ], { titleKey: "title", maxItems: 3 }),
      ],
    },
    {
      key: "programme",
      title: "Programme",
      fields: [
        select("programmeStatus", "Programme status", [
          { value: "tba", label: "To be announced — show placeholder" },
          { value: "draft", label: "Draft — show sessions marked “subject to change”" },
          { value: "final", label: "Final" },
        ]),
        textarea("programmeNote", "Note above the schedule"),
        file("schedulePdf", "Schedule PDF (optional)", { accept: "application/pdf", help: "Upload to replace the automatically generated PDF." }),
      ],
    },
    {
      key: "venue",
      title: "Venue & travel",
      fields: [
        text("mapQuery", "Map location", { help: "Search text for the embedded Google Map, e.g. a building name." }),
        url("mapEmbedUrl", "Custom map embed URL (optional)", { help: "Paste the src of a Google Maps “Embed a map” iframe." }),
        objects("directions", "Directions", "Route", [
          select("mode", "Mode", [
            { value: "air", label: "By air" },
            { value: "rail", label: "By train" },
            { value: "metro", label: "By metro" },
            { value: "road", label: "By road" },
          ], { width: "half" }),
          text("title", "Title", { required: true, width: "half" }),
          textarea("details", "Details", { rows: 3 }),
        ]),
        richtext("campusEntry", "Campus entry information"),
        objects("accommodation", "Nearby accommodation", "Option", [
          text("name", "Name", { required: true, width: "half" }),
          select("kind", "Type", [
            { value: "campus", label: "On campus" },
            { value: "guesthouse", label: "Guest house" },
            { value: "hotel", label: "Hotel" },
            { value: "area", label: "Area" },
          ], { width: "half" }),
          text("distance", "Distance", { width: "half" }),
          url("url", "Link", { width: "half" }),
          textarea("note", "Note", { rows: 2 }),
        ]),
        list("localInfo", "Local tips", { itemLabel: "Tip" }),
      ],
    },
    {
      key: "partners",
      title: "Partners & kiosks",
      fields: [
        textarea("sponsorshipIntro", "Sponsorship introduction"),
        objects("sponsorTiers", "Sponsorship tiers", "Tier", [
          text("name", "Tier name", { required: true, width: "half" }),
          text("price", "Contribution", { width: "half", placeholder: "On request" }),
          list("perks", "Benefits", { itemLabel: "Benefit" }),
        ]),
        file("sponsorBrochure", "Sponsorship brochure (PDF)", { accept: "application/pdf" }),
        textarea("kioskIntro", "Industry kiosks introduction"),
      ],
    },
    {
      key: "contact",
      title: "Contact & social",
      fields: [
        email("contactEmail", "Official e-mail", { width: "half" }),
        text("contactPhone", "Phone (optional)", { width: "half" }),
        email("notifyEmail", "Send form notifications to", { width: "half", help: "New registrations and enquiries are e-mailed here (needs SMTP)." }),
        url("website", "Website", { width: "half" }),
        url("linkedin", "LinkedIn", { width: "half" }),
        url("x", "X / Twitter", { width: "half" }),
        url("instagram", "Instagram", { width: "half" }),
        url("youtube", "YouTube", { width: "half" }),
      ],
    },
    {
      key: "branding",
      title: "Branding",
      description: "Upload the official IIT Delhi and ScAI logo files and set the brand colour once they are shared.",
      fields: [
        image("logoIITD", "IIT Delhi logo", { width: "half" }),
        image("logoScAI", "ScAI logo", { width: "half" }),
        image("eventLogo", "Event logo", { width: "half" }),
        color("brandColor", "Brand colour", { width: "half", help: "Hex colour, e.g. #3b5bdb. Leave blank for the default." }),
        image("ogImage", "Social preview image (optional)", { help: "1200×630 px. Leave blank to use the generated preview." }),
      ],
    },
    {
      key: "features",
      title: "Features & post-event",
      fields: [
        bool("showMoreSpeakers", "Show the “More speakers to be announced” card"),
        bool("showAssistant", "Show the “Ask Aura” helper button"),
        bool("showGallery", "Post-event: show the photo gallery"),
        bool("showTalks", "Post-event: show talk slides & recordings"),
        bool("showWinners", "Post-event: show hackathon winners"),
        text("bannerText", "Site-wide banner (optional)", { help: "A short notice shown at the very top of every page." }),
        url("bannerLink", "Banner link (optional)"),
      ],
    },
    {
      key: "seo",
      title: "SEO & analytics",
      fields: [
        text("gaId", "Google Analytics measurement ID", { placeholder: "G-XXXXXXXXXX", width: "half" }),
        list("keywords", "Search keywords", { itemLabel: "Keyword" }),
      ],
    },
  ],
};

export const HACKATHON_DEF: SingletonDef = {
  key: "hackathon",
  label: "Hackathon",
  description: "Everything on the Hackathon page. Mentors and judges are managed under Organisers & volunteers.",
  tags: ["hackathon"],
  sections: [
    {
      key: "overview",
      title: "Overview",
      fields: [
        text("title", "Title", { required: true }),
        text("tagline", "Tagline"),
        richtext("overview", "Overview"),
        text("mode", "Mode", { width: "half", placeholder: "On-site / hybrid — to be announced" }),
        text("teamSize", "Team size", { width: "half" }),
        text("prizePool", "Prize pool", { width: "half", placeholder: "TBA" }),
        list("eligibility", "Eligibility", { itemLabel: "Rule" }),
        textarea("registrationNote", "Registration note"),
      ],
    },
    {
      key: "tracks",
      title: "Problem tracks",
      fields: [
        objects("tracks", "Tracks", "Track", [
          select("theme", "Theme", themeOptions, { width: "half" }),
          text("title", "Title", { required: true, width: "half" }),
          textarea("description", "Description"),
          list("problems", "Example problem statements", { itemLabel: "Problem" }),
        ], { titleKey: "title" }),
      ],
    },
    {
      key: "rules",
      title: "Rules & conduct",
      fields: [list("rules", "Rules", { itemLabel: "Rule" }), richtext("codeOfConduct", "Code of conduct")],
    },
    {
      key: "timeline",
      title: "Timeline",
      fields: [
        objects("timeline", "Milestones", "Milestone", [
          text("label", "Milestone", { required: true, width: "half" }),
          date("date", "Date", { width: "half", help: "Leave blank while the date is TBA." }),
          text("dateLabel", "Date text (optional)", { width: "half", placeholder: "TBA" }),
          textarea("description", "Description", { rows: 2 }),
        ], { titleKey: "label" }),
      ],
    },
    {
      key: "prizes",
      title: "Prizes & judging",
      fields: [
        objects("prizes", "Prizes", "Prize", [
          text("place", "Place / award", { required: true, width: "half" }),
          text("reward", "Reward", { width: "half", placeholder: "TBA" }),
          textarea("description", "Description", { rows: 2 }),
        ], { titleKey: "place" }),
        objects("judgingCriteria", "Judging criteria", "Criterion", [
          text("name", "Criterion", { required: true, width: "half" }),
          num("weight", "Weight (%)", { min: 0, max: 100, width: "half" }),
          textarea("description", "Description", { rows: 2 }),
        ], { titleKey: "name" }),
      ],
    },
    {
      key: "resources",
      title: "Resources",
      fields: [
        objects("resources", "Resources", "Resource", [
          select("kind", "Type", [
            { value: "api", label: "API / model access" },
            { value: "dataset", label: "Dataset" },
            { value: "compute", label: "Compute credits" },
            { value: "tool", label: "Tool / framework" },
            { value: "other", label: "Other" },
          ], { width: "half" }),
          text("title", "Title", { required: true, width: "half" }),
          textarea("description", "Description", { rows: 2 }),
          url("url", "Link"),
        ], { titleKey: "title" }),
      ],
    },
    {
      key: "results",
      title: "Results",
      description: "Shown only after you enable “Post-event: show hackathon winners” in Settings → Features.",
      fields: [
        textarea("resultsNote", "Results introduction"),
        objects("winners", "Winners", "Winner", [
          text("position", "Position / award", { required: true, width: "half" }),
          text("team", "Team name", { required: true, width: "half" }),
          text("project", "Project", { width: "half" }),
          text("members", "Members", { width: "half" }),
          textarea("description", "Description", { rows: 2 }),
          url("link", "Project link"),
        ], { titleKey: "team" }),
      ],
    },
  ],
};

export const SINGLETONS = { settings: SETTINGS_DEF, hackathon: HACKATHON_DEF } as const;

/* Form option lists used by the public registration forms */
export const attendeeCategoryKeys = ATTENDEE_CATEGORIES;
export const registrationStatusKeys = REGISTRATION_STATUSES;
export const programmeStatusKeys = PROGRAMME_STATUSES;

export function flattenFields(sections: FieldSection[]): FieldDef[] {
  return sections.flatMap((s) => s.fields);
}
