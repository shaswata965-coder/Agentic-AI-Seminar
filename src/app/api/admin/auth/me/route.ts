import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { json } from "@/lib/server/http";

export async function GET(req: NextRequest) {
  const user = await requireAdmin(req);
  if (user instanceof Response) return user;
  return json({ data: user });
}
