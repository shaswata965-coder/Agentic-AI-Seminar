import "server-only";
import mongoose from "mongoose";
import { DEFAULT_HACKATHON, DEFAULT_SETTINGS, withCurrentAboutPoints } from "@/lib/content/defaults";
import { fillDefaults, mergeDefaults, toPlain } from "@/lib/content/normalize";
import { connectDb } from "@/lib/db";
import { slugify } from "@/lib/format";
import { getCollectionModel, Singleton } from "@/lib/models";
import { COLLECTION_MAP, flattenFields, SINGLETONS, type CollectionDef } from "@/lib/schema/resources";
import { objectSchema } from "@/lib/schema/field-validation";
import { zodFieldErrors } from "./http";
import { expireTags } from "./revalidate";

export class ValidationError extends Error {
  constructor(public fieldErrors: Record<string, string>) {
    super("Validation failed");
  }
}

export function collectionDef(key: string): CollectionDef | null {
  return COLLECTION_MAP[key] ?? null;
}

const isId = (id: string) => mongoose.isValidObjectId(id) && /^[a-f0-9]{24}$/i.test(id);

export async function listItems(def: CollectionDef) {
  await connectDb();
  const docs = await getCollectionModel(def.key).find({}).sort(def.sort).lean();
  return docs.map((d) => fillDefaults<Record<string, unknown>>(def.fields, toPlain<Record<string, unknown>>(d)));
}

export async function getItem(def: CollectionDef, id: string) {
  if (!isId(id)) return null;
  await connectDb();
  const doc = await getCollectionModel(def.key).findById(id).lean();
  return doc ? fillDefaults<Record<string, unknown>>(def.fields, toPlain<Record<string, unknown>>(doc)) : null;
}

function validate(def: CollectionDef, input: unknown) {
  const parsed = objectSchema(def.fields).safeParse(input ?? {});
  if (!parsed.success) throw new ValidationError(zodFieldErrors(parsed.error));
  return parsed.data as Record<string, unknown>;
}

async function uniqueSlug(def: CollectionDef, base: string, excludeId?: string) {
  const Model = getCollectionModel(def.key);
  const root = slugify(base) || def.singular.toLowerCase();
  let slug = root;
  for (let i = 2; i < 200; i++) {
    const clash = await Model.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
    if (!clash) return slug;
    slug = `${root}-${i}`;
  }
  return `${root}-${Date.now()}`;
}

async function prepare(def: CollectionDef, data: Record<string, unknown>, excludeId?: string) {
  if (def.slugFrom) {
    const wanted = String(data.slug || data[def.slugFrom] || "");
    data.slug = await uniqueSlug(def, wanted, excludeId);
  }
  return data;
}

export async function createItem(def: CollectionDef, input: unknown) {
  const data = validate(def, { ...(def.defaults ?? {}), ...(input as object) });
  await connectDb();
  const Model = getCollectionModel(def.key);
  if ((data.order === null || data.order === undefined) && "order" in Model.schema.paths) {
    const last = await Model.findOne({}).sort({ order: -1 }).lean();
    data.order = (Number(last?.order) || 0) + 10;
  }
  const doc = await Model.create(await prepare(def, data));
  expireTags(def.tags);
  return fillDefaults<Record<string, unknown>>(def.fields, toPlain<Record<string, unknown>>(doc.toObject()));
}

export async function updateItem(def: CollectionDef, id: string, input: unknown) {
  if (!isId(id)) return null;
  const data = validate(def, input);
  await connectDb();
  const doc = await getCollectionModel(def.key).findByIdAndUpdate(id, await prepare(def, data, id), { returnDocument: "after", runValidators: true }).lean();
  if (!doc) return null;
  expireTags(def.tags);
  return fillDefaults<Record<string, unknown>>(def.fields, toPlain<Record<string, unknown>>(doc));
}

export async function deleteItem(def: CollectionDef, id: string) {
  if (!isId(id)) return false;
  await connectDb();
  const res = await getCollectionModel(def.key).deleteOne({ _id: id });
  if (res.deletedCount) expireTags(def.tags);
  return res.deletedCount > 0;
}

export async function reorderItems(def: CollectionDef, ids: string[]) {
  const valid = ids.filter(isId);
  await connectDb();
  await getCollectionModel(def.key).bulkWrite(valid.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: (i + 1) * 10 } } } })));
  expireTags(def.tags);
}

/* ------------------------------------------------------------ Singletons -- */

const SINGLETON_DEFAULTS = { settings: DEFAULT_SETTINGS, hackathon: DEFAULT_HACKATHON } as const;
export type SingletonKey = keyof typeof SINGLETONS;

export function isSingletonKey(key: string): key is SingletonKey {
  return key in SINGLETONS;
}

export async function getSingleton(key: SingletonKey) {
  await connectDb();
  const doc = await Singleton.findOne({ key }).lean();
  const data = mergeDefaults(SINGLETON_DEFAULTS[key] as object, doc?.data);
  return { data: key === "settings" ? withCurrentAboutPoints(data) : data, updatedAt: doc?.updatedAt ?? null };
}

export async function saveSingleton(key: SingletonKey, input: unknown) {
  const def = SINGLETONS[key];
  const parsed = objectSchema(flattenFields(def.sections)).safeParse(input ?? {});
  if (!parsed.success) throw new ValidationError(zodFieldErrors(parsed.error));
  await connectDb();
  const doc = await Singleton.findOneAndUpdate({ key }, { $set: { data: parsed.data } }, { upsert: true, returnDocument: "after" }).lean();
  expireTags(def.tags);
  return { data: mergeDefaults(SINGLETON_DEFAULTS[key] as object, doc?.data), updatedAt: doc?.updatedAt ?? null };
}
