import { isDuplicateKeyError } from "@/lib/db";
import { getCollectionModel, Singleton } from "@/lib/models";
import { objectSchema } from "@/lib/schema/field-validation";
import { COLLECTION_MAP } from "@/lib/schema/resources";
import { DEFAULT_FAQS, DEFAULT_HACKATHON, DEFAULT_PEOPLE, DEFAULT_SESSIONS, DEFAULT_SETTINGS } from "./defaults";

/*
 * Default content from the website brief (event facts, organisers, FAQs).
 * Stored automatically the first time the site connects to an empty database,
 * and by `npm run seed`. Never overwrites content that already exists.
 * Free of Next.js imports so the CLI scripts in /scripts can use it.
 */

/** Marks that the tentative programme was offered to this site, so it is added at most once. */
const PROGRAMME_PLAN_KEY = "programme-plan";
/** Marks that the FAQ answers below were brought up to date once (free registration, places confirmed by the committee). */
const PLACES_FAQS_KEY = "faqs-places";

/** FAQ answers stored by sites set up earlier, oldest first: updated once where never edited. */
const RETIRED_FAQ_ANSWERS: { question: string; answer: string }[] = [
  {
    question: "Who can attend the workshop?",
    answer: "The workshop is open to researchers, faculty, students, industry practitioners, startups and investors interested in agentic AI. Registration is required.",
  },
  { question: "Is there a registration fee?", answer: "Fee details (if any) will be announced on the Registration page. Register early: seats may be limited." },
  // While the workshop was by invitation.
  {
    question: "Who can attend the workshop?",
    answer: "The workshop is by invitation, for researchers, faculty, students, industry practitioners, startups and investors working on agentic AI. Every invitee must register to get entry.",
  },
  { question: "Is there a registration fee?", answer: "No. Registration is free, but it is mandatory: invitees need to register to get entry." },
];

async function insertSingleton(key: "settings" | "hackathon" | typeof PROGRAMME_PLAN_KEY | typeof PLACES_FAQS_KEY, data: object): Promise<boolean> {
  try {
    const res = await Singleton.updateOne({ key }, { $setOnInsert: { key, data } }, { upsert: true });
    return res.upsertedCount > 0;
  } catch (err) {
    if (isDuplicateKeyError(err)) return false; // created at the same moment by another process
    throw err;
  }
}

/** Returns a description of everything that was created. */
export async function ensureDefaultContent({ fillEmpty = false }: { fillEmpty?: boolean } = {}): Promise<string[]> {
  const created: string[] = [];
  const freshSite = await insertSingleton("settings", DEFAULT_SETTINGS);
  if (freshSite) created.push("site settings");
  if (await insertSingleton("hackathon", DEFAULT_HACKATHON)) created.push("hackathon details");

  // The tentative programme goes to a site without sessions: once (sites set up before it existed get it on
  // their next start), or whenever asked for. Deleting it in the admin doesn't bring it back after a restart.
  const planOffered = await insertSingleton(PROGRAMME_PLAN_KEY, { at: new Date().toISOString() });
  if (planOffered || fillEmpty) {
    const Sessions = getCollectionModel("sessions");
    if ((await Sessions.countDocuments()) === 0) {
      const def = COLLECTION_MAP.sessions;
      await Sessions.insertMany(DEFAULT_SESSIONS.map((s) => objectSchema(def.fields).parse({ ...def.defaults, ...s })));
      // The plan is shown as a draft ("subject to change") instead of "to be announced".
      await Singleton.updateOne({ key: "settings", "data.programmeStatus": "tba" }, { $set: { "data.programmeStatus": "draft" } });
      created.push(`the tentative programme (${DEFAULT_SESSIONS.length} sessions)`);
    }
  }

  if (await insertSingleton(PLACES_FAQS_KEY, { at: new Date().toISOString() })) {
    const Faqs = getCollectionModel("faqs");
    for (const old of RETIRED_FAQ_ANSWERS) {
      const current = DEFAULT_FAQS.find((f) => f.question === old.question);
      if (current) await Faqs.updateMany({ question: old.question, answer: old.answer }, { $set: { answer: current.answer } });
    }
  }

  // Organisers and FAQs are only added to a brand-new site (or when asked for),
  // so deleting them in the admin doesn't bring them back after a restart.
  if (freshSite || fillEmpty) {
    const People = getCollectionModel("people");
    if ((await People.countDocuments()) === 0) {
      await People.insertMany(DEFAULT_PEOPLE);
      created.push(`${DEFAULT_PEOPLE.length} organisers`);
    }
    const Faqs = getCollectionModel("faqs");
    if ((await Faqs.countDocuments()) === 0) {
      await Faqs.insertMany(DEFAULT_FAQS);
      created.push(`${DEFAULT_FAQS.length} FAQs`);
    }
  }
  return created;
}
