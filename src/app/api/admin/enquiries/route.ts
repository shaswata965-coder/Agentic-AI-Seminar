import type { NextRequest } from "next/server";
import { toPlain } from "@/lib/content/normalize";
import { Enquiry } from "@/lib/models";
import { requireAdmin } from "@/lib/server/admin-auth";
import { json } from "@/lib/server/http";

export async function GET(req: NextRequest) {
  const user = await requireAdmin(req);
  if (user instanceof Response) return user;
  const docs = await Enquiry.find({}).sort({ createdAt: -1 }).limit(5000).lean();
  return json({ data: docs.map((d) => toPlain(d)) });
}
