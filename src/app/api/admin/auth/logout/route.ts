import { clearedSessionCookie } from "@/lib/server/admin-auth";
import { json } from "@/lib/server/http";

export async function POST() {
  const res = json({ ok: true });
  res.cookies.set(clearedSessionCookie());
  return res;
}
