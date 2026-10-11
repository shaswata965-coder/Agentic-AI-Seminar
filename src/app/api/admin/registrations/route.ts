import type { NextRequest } from "next/server";
import { toPlain } from "@/lib/content/normalize";
import { HackathonRegistration, Registration } from "@/lib/models";
import { requireAdmin } from "@/lib/server/admin-auth";
import { json } from "@/lib/server/http";

/** ?type=workshop (default) | hackathon */
export async function GET(req: NextRequest) {
  const user = await requireAdmin(req);
  if (user instanceof Response) return user;
  const type = req.nextUrl.searchParams.get("type") === "hackathon" ? "hackathon" : "workshop";
  const docs =
    type === "hackathon"
      ? await HackathonRegistration.find({}).sort({ createdAt: -1 }).limit(5000).lean()
      : await Registration.find({}).sort({ createdAt: -1 }).limit(10000).lean();
  return json({ data: docs.map((d) => toPlain(d)) });
}
