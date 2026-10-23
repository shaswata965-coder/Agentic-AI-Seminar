import type { NextRequest } from "next/server";
import { agendaSchema, saveAgenda } from "@/lib/server/agenda";
import { error, isSameOrigin, json, readJson } from "@/lib/server/http";
import { getVisitor } from "@/lib/server/visitor-auth";

/** Replace the signed-in visitor's agenda with the sessions sent ({ sessions: [id…] }). */
export async function PUT(req: NextRequest) {
  if (!isSameOrigin(req)) return error(403, "Cross-site request blocked.");
  try {
    const v = await getVisitor(req);
    if (!v) return error(401, "Sign in to keep an agenda.");
    const body = (await readJson(req, 32 * 1024)) as { sessions?: unknown } | null;
    const parsed = agendaSchema.safeParse(body?.sessions);
    if (!parsed.success) return error(400, "That agenda can't be saved.");
    await saveAgenda(v.email, parsed.data);
    return json({ data: { agenda: parsed.data } });
  } catch {
    return error(503, "Your agenda can't be saved right now. Please try again shortly.");
  }
}
