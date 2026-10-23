import type { NextRequest } from "next/server";
import { z } from "zod";
import { agendaSchema, readAgenda, saveAgenda } from "@/lib/server/agenda";
import { clientIp, error, isSameOrigin, json, readJson } from "@/lib/server/http";
import { clearHits, hit, isLimited, rateLimit } from "@/lib/server/rate-limit";
import { identify, startVisitorSession } from "@/lib/server/visitor-auth";

const schema = z.object({
  email: z.string().trim().toLowerCase().min(3).max(254),
  code: z.string().min(1).max(200),
  /** Sessions starred in this browser before signing in, added to the account's agenda. */
  agenda: agendaSchema.optional(),
});

const WINDOW = 15 * 60_000;
const FAILED = "That e-mail and password, registration ID or sign-in code don't match.";

/**
 * Sign in on the public site (see visitor-auth.ts for who can). Failed attempts are limited per address,
 * per e-mail from one address and per e-mail overall, as for the admin panel.
 */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return error(403, "Cross-site request blocked.");
  const ip = clientIp(req);
  if (!rateLimit(`visitor-login:${ip}`, 30, WINDOW).ok || isLimited(`visitor-fail:${ip}`, 10, WINDOW).limited) return error(429, "Too many sign-in attempts. Please wait 15 minutes.");

  const parsed = schema.safeParse(await readJson(req, 16 * 1024));
  if (!parsed.success) return error(400, "Enter your e-mail and your password, registration ID or sign-in code.");
  const { email, code, agenda } = parsed.data;
  const fromHere = `visitor-fail:${email}:${ip}`;
  const anywhere = `visitor-fail:${email}`;
  if (isLimited(fromHere, 8, WINDOW).limited || isLimited(anywhere, 100, WINDOW).limited) return error(429, "Too many sign-in attempts for this e-mail. Please wait 15 minutes.");

  try {
    const visitor = await identify(email, code);
    if (!visitor) {
      hit(`visitor-fail:${ip}`, WINDOW);
      hit(fromHere, WINDOW);
      hit(anywhere, WINDOW);
      return error(401, FAILED);
    }
    clearHits(fromHere);
    let saved = await readAgenda(email);
    if (agenda?.length) {
      saved = [...new Set([...saved, ...agenda])].slice(0, 200);
      await saveAgenda(email, saved);
    }
    const res = json({ data: { account: visitor, agenda: saved } });
    res.cookies.set(await startVisitorSession(visitor));
    return res;
  } catch (err) {
    console.error("[account/login]", err);
    return error(503, "Signing in is unavailable right now. Please try again shortly.");
  }
}
