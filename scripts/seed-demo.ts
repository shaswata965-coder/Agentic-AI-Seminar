/**
 * Load clearly-labelled SAMPLE content (speakers, programme, tutorials,
 * demos, kiosks, partners, mentors, judges, volunteers, announcements) to
 * preview the design before the real content is ready. Every sample is
 * tracked, so it can be removed again in one step.
 *
 *   npm run seed:demo              add the samples
 *   npm run seed:demo -- --remove  remove every sample (your own content is kept)
 *   npm run seed:demo -- --reset   remove, then add them again
 *
 * Never leave sample content on the live site: the admin dashboard shows a
 * warning while it is loaded.
 */
import mongoose from "mongoose";
import { ensureDefaultContent } from "@/lib/content/bootstrap";
import { DEMO_DOC_ID, demoCollection, type DemoRecord } from "@/lib/demo-content";
import { slugify } from "@/lib/format";
import { getCollectionModel, Singleton } from "@/lib/models";
import { objectSchema } from "@/lib/schema/field-validation";
import { COLLECTION_MAP } from "@/lib/schema/resources";
import { cliArgs, connect, RESTART_HINT, run } from "./lib/cli";

const NOTE = "Sample content to preview the layout. Edit or delete it in the admin panel, or run `npm run seed:demo -- --remove`.";
// For plain-text fields (no formatting).
const NOTE_PLAIN = "Sample content to preview the layout. Edit or delete it in the admin panel.";

/* ---------------------------------------------------------------- Data -- */

type SpeakerKey = "meera" | "alan" | "grace" | "rohan" | "kavya" | "katherine" | "arjun" | "ishaan";

const SPEAKERS: Record<SpeakerKey, Record<string, unknown>> = {
  meera: {
    name: "Dr. Meera Placeholder",
    designation: "Professor of Biomedical Informatics (sample profile)",
    affiliation: "Example University",
    category: "academia",
    theme: "healthcare",
    keynote: true,
    featured: true,
    bio: `**Sample profile.** Meera studies how AI agents can support clinicians with triage, documentation and follow-up care, with a focus on safety and fairness.\n\n${NOTE}`,
    talkTitle: "Agents at the bedside: safe autonomy in clinical workflows",
    talkAbstract: "How much autonomy should a clinical agent have? This sample talk walks through guard-rails, human-in-the-loop review and evaluation for agents that summarise records and draft care plans.",
    website: "https://example.com",
  },
  alan: {
    name: "Prof. Alan Example",
    designation: "Professor of Materials Science (sample profile)",
    affiliation: "Sample Institute of Science",
    category: "academia",
    theme: "science",
    keynote: true,
    featured: true,
    bio: `**Sample profile.** Alan builds self-driving laboratories in which agents plan experiments, operate instruments and learn from every result.\n\n${NOTE}`,
    talkTitle: "The autonomous lab: agents that design, run and learn from experiments",
    talkAbstract: "A sample abstract about closing the loop between hypothesis generation, robotic experimentation and analysis, and what changes when agents run the lab overnight.",
    website: "https://example.com",
  },
  grace: {
    name: "Dr. Grace Sample",
    designation: "Research Scientist, Agentic Systems (sample profile)",
    affiliation: "Placeholder AI Labs",
    category: "industry",
    theme: "science",
    featured: true,
    bio: `**Sample profile.** Grace works on tool-using language-model agents, planning and memory for long-running tasks.\n\n${NOTE}`,
    talkTitle: "Planning, tools and memory: anatomy of a reliable agent",
    talkAbstract: "This sample talk breaks an agent into perception, planning, tool use and reflection, with practical patterns for making each part dependable.",
    github: "https://github.com",
  },
  rohan: {
    name: "Rohan Demo",
    designation: "Co-founder & CTO (sample profile)",
    affiliation: "DemoStack (sample start-up)",
    category: "industry",
    theme: "enterprise",
    keynote: true,
    featured: true,
    bio: `**Sample profile.** Rohan co-founded a start-up that turns agent prototypes into products used by thousands of small businesses.\n\n${NOTE}`,
    talkTitle: "From demo to product: shipping agentic AI to real customers",
    talkAbstract: "A sample abstract on pricing, reliability, evaluation and support when your product is an AI agent: lessons from building a start-up.",
    website: "https://example.com",
  },
  kavya: {
    name: "Dr. Kavya Mockup",
    designation: "Clinical AI Lead (sample profile)",
    affiliation: "Sample Health Systems",
    category: "industry",
    theme: "healthcare",
    bio: `**Sample profile.** Kavya leads the deployment of AI assistants across a network of hospitals.\n\n${NOTE}`,
  },
  katherine: {
    name: "Katherine Template",
    designation: "Partner (sample profile)",
    affiliation: "Example Ventures",
    category: "panelist",
    theme: "enterprise",
    bio: `**Sample profile.** Katherine invests in early-stage AI companies.\n\n${NOTE}`,
  },
  arjun: {
    name: "Dr. Arjun Prototype",
    designation: "Associate Professor of Physics (sample profile)",
    affiliation: "Example University",
    category: "panelist",
    theme: "science",
    bio: `**Sample profile.** Arjun uses machine learning to speed up simulations in physics and chemistry.\n\n${NOTE}`,
  },
  ishaan: {
    name: "Ishaan Sandbox",
    designation: "Product Manager, AI Platforms (sample profile)",
    affiliation: "Placeholder Cloud",
    category: "panelist",
    theme: "general",
    bio: `**Sample profile.** Ishaan builds developer platforms for deploying and monitoring agents.\n\n${NOTE}`,
  },
};

type SessionSeed = Record<string, unknown> & { speakers?: SpeakerKey[]; moderator?: SpeakerKey; panelists?: SpeakerKey[] };

const SESSIONS: SessionSeed[] = [
  { day: "1", start: "08:30", end: "09:30", type: "break", title: "Registration & breakfast", room: "Foyer" },
  { day: "1", start: "09:30", end: "10:00", type: "other", title: "Welcome & inauguration", speakerNote: "Organising committee", room: "Main hall" },
  { day: "1", start: "10:00", end: "10:45", type: "keynote", theme: "healthcare", title: "Agents at the bedside: safe autonomy in clinical workflows", speakers: ["meera"], room: "Main hall" },
  { day: "1", start: "10:45", end: "11:15", type: "break", title: "Tea break & industry kiosks", room: "Exhibition area" },
  { day: "1", start: "11:15", end: "12:00", type: "talk", theme: "science", title: "Planning, tools and memory: anatomy of a reliable agent", speakers: ["grace"], room: "Main hall" },
  {
    day: "1",
    start: "12:00",
    end: "13:00",
    type: "panel",
    theme: "healthcare",
    title: "Panel: agentic AI in healthcare, promise and pitfalls",
    moderator: "meera",
    panelists: ["kavya", "ishaan"],
    room: "Main hall",
    description: "A sample panel on safety, regulation and adoption of AI agents in hospitals.",
  },
  { day: "1", start: "13:00", end: "14:00", type: "break", title: "Lunch", room: "Dining hall" },
  { day: "1", start: "14:00", end: "15:30", type: "tutorial", theme: "general", title: "Tutorial: build your first tool-using agent", speakers: ["grace", "ishaan"], room: "Lab 1" },
  { day: "1", start: "15:30", end: "16:30", type: "demo", theme: "general", title: "Live demos: agents in action", speakerNote: "Demo teams", room: "Exhibition area" },
  { day: "1", start: "16:30", end: "17:30", type: "hackathon", title: "Hackathon final round: team presentations (part 1)", speakerNote: "Shortlisted teams", room: "Hackathon arena" },
  { day: "2", start: "09:30", end: "10:15", type: "keynote", theme: "enterprise", title: "From demo to product: shipping agentic AI to real customers", speakers: ["rohan"], room: "Main hall" },
  { day: "2", start: "10:15", end: "11:00", type: "talk", theme: "science", title: "The autonomous lab: agents that design, run and learn from experiments", speakers: ["alan"], room: "Main hall" },
  { day: "2", start: "11:00", end: "11:30", type: "break", title: "Tea break & industry kiosks", room: "Exhibition area" },
  {
    day: "2",
    start: "11:30",
    end: "12:30",
    type: "panel",
    theme: "enterprise",
    title: "Panel: building agentic AI start-ups in India",
    moderator: "rohan",
    panelists: ["katherine", "arjun", "ishaan"],
    room: "Main hall",
    description: "A sample panel with founders and investors on funding, talent and go-to-market for agentic AI products.",
  },
  { day: "2", start: "12:30", end: "13:30", type: "break", title: "Lunch", room: "Dining hall" },
  { day: "2", start: "13:30", end: "15:00", type: "tutorial", theme: "science", title: "Tutorial: agentic workflows for scientific data", speakers: ["alan", "arjun"], room: "Lab 1" },
  { day: "2", start: "15:00", end: "16:30", type: "hackathon", title: "Hackathon final round: team presentations (part 2) & judging", speakerNote: "Shortlisted teams and judges", room: "Hackathon arena" },
  { day: "2", start: "16:30", end: "17:30", type: "other", title: "Hackathon results, awards & closing", speakerNote: "Organising committee", room: "Main hall" },
];

const TUTORIALS = [
  {
    title: "Build your first tool-using agent",
    schedule: "Day 1 · 14:00–15:30 · Lab 1",
    level: "beginner",
    duration: "90 minutes",
    theme: "general",
    instructors: [
      { name: "Dr. Grace Sample", affiliation: "Placeholder AI Labs", url: "" },
      { name: "Ishaan Sandbox", affiliation: "Placeholder Cloud", url: "" },
    ],
    description: `Write a small agent that plans, calls tools (search, a calculator and a database) and checks its own work.\n\n${NOTE}`,
    prerequisites: ["Laptop with Python 3.11 or newer", "Comfortable with basic Python", "Free LLM API key (instructions sent before the workshop)"],
    materials: [{ label: "Sample materials (placeholder link)", url: "https://example.com/materials" }],
    capacity: "60 seats (sample)",
  },
  {
    title: "Agentic workflows for scientific data",
    schedule: "Day 2 · 13:30–15:00 · Lab 1",
    level: "intermediate",
    duration: "90 minutes",
    theme: "science",
    instructors: [
      { name: "Prof. Alan Example", affiliation: "Sample Institute of Science", url: "" },
      { name: "Dr. Arjun Prototype", affiliation: "Example University", url: "" },
    ],
    description: `Use agents to search the literature, plan an analysis and run notebooks on real-looking experimental data.\n\n${NOTE}`,
    prerequisites: ["Laptop with Python and Jupyter", "Familiarity with pandas", "GitHub account"],
    materials: [{ label: "Sample notebook (placeholder link)", url: "https://example.com/notebook" }],
    capacity: "40 seats (sample)",
  },
  {
    title: "Evaluating and red-teaming AI agents",
    schedule: "To be announced",
    level: "advanced",
    duration: "2 hours",
    theme: "healthcare",
    instructors: [{ name: "Dr. Meera Placeholder", affiliation: "Example University", url: "" }],
    description: `Design test suites, measure reliability and probe agents for unsafe behaviour before they reach users.\n\n${NOTE}`,
    prerequisites: ["Experience building LLM applications", "Laptop with Python"],
    materials: [],
    capacity: "30 seats (sample)",
  },
];

const DEMOS = [
  { title: "Clinical notes summariser", team: "Sample Health Lab", theme: "healthcare", description: `An agent that reads discharge notes, flags missing information and drafts a patient-friendly summary for a clinician to approve.\n\n${NOTE_PLAIN}` },
  { title: "Self-driving lab assistant", team: "Example University, Materials Lab", theme: "science", description: `An agent that proposes the next experiment, schedules the instruments and updates its model after every measurement.\n\n${NOTE_PLAIN}` },
  { title: "Founder's research co-pilot", team: "DemoStack (sample start-up)", theme: "enterprise", description: `An agent that researches a market, compares competitors and drafts an investor memo with sources.\n\n${NOTE_PLAIN}` },
];

const KIOSKS = [
  { company: "Placeholder AI Labs", booth: "Kiosk 1", theme: "general", website: "https://example.com", description: "Sample exhibitor showing an agent platform for enterprise workflows. Replace with a real exhibitor in the admin panel." },
  { company: "Sample Health Systems", booth: "Kiosk 2", theme: "healthcare", website: "https://example.com", description: "Sample exhibitor demonstrating AI assistants for hospital operations." },
  { company: "DemoStack", booth: "Kiosk 3", theme: "enterprise", website: "https://example.com", description: "Sample start-up exhibiting no-code tools for building customer-support agents." },
];

const SPONSORS = [
  { name: "Example Corp", tier: "platinum", website: "https://example.com", blurb: "Sample sponsor. Replace with a real partner." },
  { name: "Placeholder Cloud", tier: "gold", website: "https://example.com", blurb: "Sample sponsor. Replace with a real partner." },
  { name: "Sample Foundation", tier: "partner", website: "https://example.com", blurb: "Sample partner. Replace with a real partner." },
  { name: "Demo Developers Community", tier: "community", website: "https://example.com", blurb: "Sample community partner." },
];

const PEOPLE = [
  { name: "Neha Sandbox", group: "mentor", role: "Senior ML Engineer (sample)", affiliation: "Placeholder AI Labs", bio: "Sample mentor profile." },
  { name: "Vikram Placeholder", group: "mentor", role: "PhD scholar (sample)", affiliation: "Example University", bio: "Sample mentor profile." },
  { name: "Dr. Leela Example", group: "judge", role: "Director of AI Research (sample)", affiliation: "Example Corp", bio: "Sample judge profile." },
  { name: "Sameer Mock", group: "judge", role: "Venture Partner (sample)", affiliation: "Example Ventures", bio: "Sample judge profile." },
  { name: "Ananya Sample", group: "volunteer", role: "Volunteer (sample)", department: "B.Tech, Computer Science", affiliation: "IIT Delhi", bio: "Sample volunteer profile." },
  { name: "Kabir Demo", group: "volunteer", role: "Volunteer (sample)", department: "M.Tech, Electrical Engineering", affiliation: "IIT Delhi", bio: "Sample volunteer profile." },
];

const ANNOUNCEMENTS = [
  { title: "Sample announcement: first speakers revealed", body: "This is sample content added by the demo seed to preview the announcements box.", tone: "info", linkUrl: "/speakers", linkLabel: "Meet the speakers", pinned: true },
];

/* ------------------------------------------------------------- Helpers -- */

const record = () => demoCollection();

/** Validate like the admin panel does, so samples can be edited without errors. */
function clean(key: string, item: Record<string, unknown>, order: number) {
  const def = COLLECTION_MAP[key];
  const data = objectSchema(def.fields).parse({ ...def.defaults, order, published: true, ...item }) as Record<string, unknown>;
  if (def.slugFrom && !data.slug) data.slug = `sample-${slugify(String(data[def.slugFrom] ?? ""))}`;
  return data;
}

async function insert(key: string, items: Record<string, unknown>[], tracked: DemoRecord["items"]) {
  const docs = await getCollectionModel(key).insertMany(items.map((it, i) => clean(key, it, 900 + i)));
  for (const d of docs) tracked.push({ collection: key, id: d._id as mongoose.Types.ObjectId });
  return docs.map((d) => String(d._id));
}

async function programmeStatus(): Promise<string> {
  const doc = await Singleton.findOne({ key: "settings" }).lean();
  return String((doc?.data as { programmeStatus?: string } | undefined)?.programmeStatus ?? "tba");
}

async function add() {
  await ensureDefaultContent();
  const tracked: DemoRecord["items"] = [];

  const keys = Object.keys(SPEAKERS) as SpeakerKey[];
  const speakerIds = await insert("speakers", keys.map((k) => SPEAKERS[k]), tracked);
  const id = Object.fromEntries(keys.map((k, i) => [k, speakerIds[i]])) as Record<SpeakerKey, string>;

  const sessions = SESSIONS.map(({ speakers, moderator, panelists, ...s }) => ({
    ...s,
    speakers: speakers?.map((k) => id[k]) ?? [],
    moderator: moderator ? id[moderator] : "",
    panelists: panelists?.map((k) => id[k]) ?? [],
  }));
  await insert("sessions", sessions, tracked);
  await insert("tutorials", TUTORIALS, tracked);
  await insert("demos", DEMOS, tracked);
  await insert("kiosks", KIOSKS, tracked);
  await insert("sponsors", SPONSORS, tracked);
  await insert("people", PEOPLE, tracked);
  const now = Date.now();
  await insert("announcements", ANNOUNCEMENTS.map((a, i) => ({ ...a, date: new Date(now - i * 86_400_000).toISOString() })), tracked);

  // Show the sample programme (as a draft) so the schedule can be previewed.
  const previous = await programmeStatus();
  if (previous === "tba") await Singleton.updateOne({ key: "settings" }, { $set: { "data.programmeStatus": "draft" } });

  await record().insertOne({ _id: DEMO_DOC_ID, items: tracked, previousProgrammeStatus: previous, createdAt: new Date() });
  console.log(`✔ Added ${tracked.length} sample items (speakers, programme, tutorials, demos, kiosks, partners, people, announcements).`);
  if (previous === "tba") console.log("  Programme status switched from “To be announced” to “Draft” so the sample schedule is visible.");
}

async function remove(doc: DemoRecord) {
  const byCollection = new Map<string, mongoose.Types.ObjectId[]>();
  for (const it of doc.items) byCollection.set(it.collection, [...(byCollection.get(it.collection) ?? []), it.id]);
  let removed = 0;
  for (const [key, ids] of byCollection) {
    removed += (await getCollectionModel(key).deleteMany({ _id: { $in: ids } })).deletedCount;
  }
  // Drop links from your own sessions to sample speakers that no longer exist.
  const speakerIds = byCollection.get("speakers") ?? [];
  if (speakerIds.length) {
    const Sessions = getCollectionModel("sessions");
    await Sessions.updateMany({}, { $pull: { speakers: { $in: speakerIds }, panelists: { $in: speakerIds } } });
    await Sessions.updateMany({ moderator: { $in: speakerIds } }, { $set: { moderator: null } });
  }
  if (doc.previousProgrammeStatus === "tba" && (await programmeStatus()) === "draft") {
    await Singleton.updateOne({ key: "settings" }, { $set: { "data.programmeStatus": "tba" } });
    console.log("  Programme status set back to “To be announced”.");
  }
  await record().deleteOne({ _id: DEMO_DOC_ID });
  console.log(`✔ Removed ${removed} sample items. Your own content was not touched.`);
}

/* ---------------------------------------------------------------- Main -- */

run(async () => {
  const args = cliArgs({ remove: { type: "boolean" }, reset: { type: "boolean" } });
  if (args.help) {
    console.log("Usage: npm run seed:demo [-- --remove | --reset]\n\nAdds clearly-labelled sample content to preview the site; --remove deletes it again.");
    return;
  }
  await connect();
  const existing = await record().findOne({ _id: DEMO_DOC_ID });

  if (args.remove) {
    if (existing) await remove(existing);
    else console.log("No sample content is loaded, nothing to remove.");
  } else if (existing && !args.reset) {
    console.log(`Sample content is already loaded (${existing.items.length} items). Use --reset to replace it or --remove to delete it.`);
    return;
  } else {
    if (existing) await remove(existing);
    await add();
  }
  console.log(RESTART_HINT);
});
