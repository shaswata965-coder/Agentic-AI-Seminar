import "server-only";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { Agenda } from "@/lib/models";

/** A visitor's agenda: the ids of the programme sessions they starred. */
export const agendaSchema = z
  .array(z.string().regex(/^[\w-]{1,64}$/))
  .max(200)
  .transform((ids) => [...new Set(ids)]);

export async function readAgenda(email: string): Promise<string[]> {
  await connectDb();
  return (await Agenda.findOne({ email }).lean())?.sessions ?? [];
}

export async function saveAgenda(email: string, sessions: string[]) {
  await connectDb();
  await Agenda.updateOne({ email }, { $set: { sessions } }, { upsert: true });
}
