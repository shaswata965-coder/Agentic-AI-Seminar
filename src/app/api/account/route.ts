import type { NextRequest } from "next/server";
import { readAgenda } from "@/lib/server/agenda";
import { error, json } from "@/lib/server/http";
import { getVisitor } from "@/lib/server/visitor-auth";

/** Who is signed in on the public site (or null), and their agenda. */
export async function GET(req: NextRequest) {
  try {
    const v = await getVisitor(req);
    if (!v) return json({ data: { account: null, agenda: [] } });
    return json({ data: { account: { email: v.email, name: v.name, kind: v.kind }, agenda: await readAgenda(v.email) } });
  } catch {
    return error(503, "Accounts are unavailable right now. Please try again shortly.");
  }
}
