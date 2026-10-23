import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import { connectDb, isDbConfigured, once } from "@/lib/db";
import { getCollectionModel, Singleton } from "@/lib/models";
import { COLLECTION_MAP } from "@/lib/schema/resources";
import { ensureDefaultContent } from "./bootstrap";
import { DEFAULT_FAQS, DEFAULT_HACKATHON, DEFAULT_PEOPLE, DEFAULT_SETTINGS, withCurrentDefaults } from "./defaults";
import { fillDefaults, mergeDefaults, stripEmDashes, toPlain } from "./normalize";
import type { CollectionKey, CollectionTypes, HackathonInfo, SiteSettings } from "./types";

/*
 * Read-side data access for the public website. Every getter is cached with
 * `use cache` and tagged; saving in the admin expires the tag immediately.
 * If the database is not configured or unreachable, defaults are returned
 * with a short cache life so real content replaces them as soon as possible.
 * Stored text is passed through `stripEmDashes`: the site shows no em dashes. Settings and hackathon details
 * still holding an earlier default get the current one (`withCurrentDefaults`).
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

/**
 * Unsaved changes shown by the live preview in the admin (see /api/admin/preview): Site settings, and the
 * hackathon details its Hackathon tab edits too.
 */
export const DRAFT_KEYS = { settings: "settings-draft", hackathon: "hackathon-draft" } as const;
const DRAFT_MAX_AGE = 2 * 60 * 60_000;

/** A singleton as saved or, in the admin's preview, as its draft (while it is fresh). */
async function findSingleton(key: keyof typeof DRAFT_KEYS, preview: boolean) {
  if (preview) {
    const draft = await Singleton.findOne({ key: DRAFT_KEYS[key] }).lean();
    if (draft?.updatedAt && Date.now() - new Date(draft.updatedAt).getTime() < DRAFT_MAX_AGE) return draft;
  }
  return Singleton.findOne({ key }).lean();
}

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag("settings", CONTENT_TAG);
  // In Draft Mode (only the admin's preview turns it on) this runs on every request, uncached,
  // and shows the draft being edited instead of the saved settings.
  const { isEnabled: preview } = await draftMode();
  return readSettings(preview);
}

/** Whether this is the admin's live preview (Draft Mode), which shows pages hidden from visitors so their texts can be edited. */
export async function inPreview(): Promise<boolean> {
  "use cache";
  cacheTag("settings", CONTENT_TAG);
  // Like getSettings: cached as false for visitors, run on every request in Draft Mode.
  return (await draftMode()).isEnabled;
}

/**
 * The saved settings, never the preview draft: for the API routes that act on
 * them (registration status and deadlines, where notifications go), so a
 * browser in Draft Mode can't make them act on unsaved changes.
 */
export async function getSavedSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag("settings", CONTENT_TAG);
  return readSettings(false);
}

async function readSettings(preview: boolean): Promise<SiteSettings> {
  const res = await load(() => findSingleton("settings", preview));
  if (!res.ok) {
    cacheLife("fallback");
    return DEFAULT_SETTINGS;
  }
  cacheLife("cms");
  return stripEmDashes(withCurrentDefaults("settings", mergeDefaults(DEFAULT_SETTINGS, toPlain<{ data?: unknown }>(res.data ?? {}).data)));
}

export async function getHackathon(): Promise<HackathonInfo> {
  "use cache";
  cacheTag("hackathon", CONTENT_TAG);
  // Like getSettings: the draft in the admin's preview, the saved details for visitors.
  const { isEnabled: preview } = await draftMode();
  const res = await load(() => findSingleton("hackathon", preview));
  if (!res.ok) {
    cacheLife("fallback");
    return DEFAULT_HACKATHON;
  }
  cacheLife("cms");
  return stripEmDashes(withCurrentDefaults("hackathon", mergeDefaults(DEFAULT_HACKATHON, toPlain<{ data?: unknown }>(res.data ?? {}).data)));
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
