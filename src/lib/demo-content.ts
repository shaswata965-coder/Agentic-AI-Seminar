import mongoose from "mongoose";

/*
 * `npm run seed:demo` records every sample item it inserts in this collection,
 * so the samples can be removed again in one step and the dashboard can warn
 * while they are still on the site.
 */
export const DEMO_COLLECTION = "demo_seed";
export const DEMO_DOC_ID = "demo";

export interface DemoRecord {
  _id: string;
  items: { collection: string; id: mongoose.Types.ObjectId }[];
  previousProgrammeStatus?: string;
  createdAt: Date;
}

export function demoCollection() {
  return mongoose.connection.collection<DemoRecord>(DEMO_COLLECTION);
}

/** Number of sample items currently loaded (0 when none). Requires an open connection. */
export async function demoItemCount(): Promise<number> {
  const doc = await demoCollection().findOne({ _id: DEMO_DOC_ID }, { projection: { items: 1 } });
  return doc?.items.length ?? 0;
}
