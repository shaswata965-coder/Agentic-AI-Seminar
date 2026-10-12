import { cacheLife, cacheTag } from "next/cache";
import { connectDb, isDbConfigured, once } from "@/lib/db";
import { getCollectionModel, Singleton } from "@/lib/models";
import { COLLECTION_MAP } from "@/lib/schema/resources";
import { ensureDefaultContent } from "./bootstrap";
import { DEFAULT_FAQS, DEFAULT_HACKATHON, DEFAULT_PEOPLE, DEFAULT_SETTINGS, withCurrentAboutPoints } from "./defaults";
import { fillDefaults, mergeDefaults, stripEmDashes, toPlain } from "./normalize";
import type { CollectionKey, CollectionTypes, HackathonInfo, SiteSettings } from "./types";

/*
 * Read-side data access for the public website. Every getter is cached with
 * `use cache` and tagged; saving in the admin expires the tag immediately.
 * If the database is not configured or unreachable, defaults are returned
 * with a short cache life so real content replaces them as soon as possible.
 * Stored text is passed through `stripEmDashes`: the site shows no em dashes.
 */

/** Added to every cached query, so "Refresh website" can expire everything at once. */
export const CONTENT_TAG = "content";

type Loaded<T> = { ok: true; data: T } | { ok: false };

async function load<T>(fn: () => Promise<T>): Promise<Loaded<T>> {
  if (!isDbConfigured()) return { ok: false };
  try {
    await connectDb();
    await once(async () => void (await ensureDefaultContent()));
    return { ok: true, data: await fn() };
  } catch (err) {
    console.warn(`[content] using fallback content: ${(err as Error).message}`);
    return { ok: false };
  }
}

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag("settings", CONTENT_TAG);
  const res = await load(() => Singleton.findOne({ key: "settings" }).lean());
  if (!res.ok) {
    cacheLife("fallback");
    return DEFAULT_SETTINGS;
  }
  cacheLife("cms");
  return stripEmDashes(withCurrentAboutPoints(mergeDefaults(DEFAULT_SETTINGS, toPlain<{ data?: unknown }>(res.data ?? {}).data)));
}

export async function getHackathon(): Promise<HackathonInfo> {
  "use cache";
  cacheTag("hackathon", CONTENT_TAG);
  const res = await load(() => Singleton.findOne({ key: "hackathon" }).lean());
  if (!res.ok) {
    cacheLife("fallback");
    return DEFAULT_HACKATHON;
  }
  cacheLife("cms");
  return stripEmDashes(mergeDefaults(DEFAULT_HACKATHON, toPlain<{ data?: unknown }>(res.data ?? {}).data));
}

const FALLBACKS: Partial<Record<CollectionKey, object[]>> = {
  people: DEFAULT_PEOPLE.map((p, i) => ({ ...p, id: `default-person-${i}` })),
  faqs: DEFAULT_FAQS.map((f, i) => ({ ...f, id: `default-faq-${i}` })),
};

async function listPublished(key: CollectionKey): Promise<object[]> {
  "use cache";
  cacheTag(key, CONTENT_TAG);
  const def = COLLECTION_MAP[key];
  const res = await load(async () => {
    const docs = await getCollectionModel(key).find({ published: true }).sort(def.sort).lean();
    return docs.map((d) => fillDefaults<object>(def.fields, toPlain<Record<string, unknown>>(d)));
  });
  if (!res.ok) {
    cacheLife("fallback");
    return (FALLBACKS[key] ?? []).map((d) => fillDefaults<object>(def.fields, d as Record<string, unknown>));
  }
  cacheLife("cms");
  return stripEmDashes(res.data);
}

async function list<K extends CollectionKey>(key: K): Promise<CollectionTypes[K][]> {
  return (await listPublished(key)) as CollectionTypes[K][];
}

export const getAnnouncements = () => list("announcements");
export const getSpeakers = () => list("speakers");
export const getSessions = () => list("sessions");
export const getTutorials = () => list("tutorials");
export const getDemos = () => list("demos");
export const getKiosks = () => list("kiosks");
export const getSponsors = () => list("sponsors");
export const getPeople = () => list("people");
export const getFaqs = () => list("faqs");
export const getGallery = () => list("gallery");
export const getTalks = () => list("talks");
