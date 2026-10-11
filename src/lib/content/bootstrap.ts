import { isDuplicateKeyError } from "@/lib/db";
import { getCollectionModel, Singleton } from "@/lib/models";
import { DEFAULT_FAQS, DEFAULT_HACKATHON, DEFAULT_PEOPLE, DEFAULT_SETTINGS } from "./defaults";

/*
 * Default content from the website brief (event facts, organisers, FAQs).
 * Stored automatically the first time the site connects to an empty database,
 * and by `npm run seed`. Never overwrites content that already exists.
 * Free of Next.js imports so the CLI scripts in /scripts can use it.
 */

async function insertSingleton(key: "settings" | "hackathon", data: object): Promise<boolean> {
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
