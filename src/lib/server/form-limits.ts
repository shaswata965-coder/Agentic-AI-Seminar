import "server-only";
import { clientIp, isRecord } from "./http";
import { hit, isLimited } from "./rate-limit";

/*
 * Rate limits for the public forms, in two layers:
 *   - per person (their IP address and the e-mail address they typed): a small allowance, so one person
 *     can't hammer a form;
 *   - per IP address as a whole: a ceiling high enough for a campus, hostel or office network where dozens
 *     of people share one address, and low enough to stop one machine flooding the forms (and the event's
 *     mail server, which sends a confirmation for each).
 * Networks listed in RATE_LIMIT_EXEMPT skip the second layer: the institute's own network, or the venue's
 * during the hackathon, where hundreds of people may register or write in at once. Load-tested in
 * docs/LOAD_TEST_REPORT.md (finding 1).
 */

export type FormKind = "register" | "hackathon" | "enquiry";

const MINUTE = 60_000;
const LIMITS: Record<FormKind, { windowMs: number; perPerson: number; perAddress: number }> = {
  register: { windowMs: 15 * MINUTE, perPerson: 8, perAddress: 100 },
  hackathon: { windowMs: 15 * MINUTE, perPerson: 6, perAddress: 40 },
  enquiry: { windowMs: 10 * MINUTE, perPerson: 5, perAddress: 40 },
};

/** The e-mail address a submission is from: the hackathon team lead's, or the form's own. */
function emailOf(form: FormKind, body: unknown): string {
  if (!isRecord(body)) return "";
  const lead = Array.isArray(body.members) && isRecord(body.members[0]) ? body.members[0].email : "";
  const email = form === "hackathon" ? lead : body.email;
  return typeof email === "string" ? email.trim().toLowerCase().slice(0, 200) : "";
}

/** Count one submission of `form` (whatever its body), unless the person or their address is over the limit. */
export function formLimit(req: Request, form: FormKind, body: unknown): { ok: boolean; retryAfter: number } {
  const { windowMs, perPerson, perAddress } = LIMITS[form];
  const ip = clientIp(req);
  const keys: [string, number][] = [[`${form}-person:${ip}:${emailOf(form, body)}`, perPerson]];
  if (!isExempt(ip)) keys.push([`${form}:${ip}`, perAddress]);
  const over = keys.map(([key, limit]) => isLimited(key, limit, windowMs)).filter((s) => s.limited);
  if (over.length) return { ok: false, retryAfter: Math.max(...over.map((s) => s.retryAfter)) };
  for (const [key] of keys) hit(key, windowMs);
  return { ok: true, retryAfter: 0 };
}

/* ------------------------------------------------------- RATE_LIMIT_EXEMPT -- */

type Network = { base: number; mask: number };
let exempt: Network[] | undefined;

function ipv4(text: string): number | null {
  const parts = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(text)?.slice(1).map(Number);
  if (!parts || parts.some((p) => p > 255)) return null;
  return parts.reduce((n, p) => n * 256 + p, 0);
}

/**
 * IPv4 addresses and ranges, e.g. "103.27.8.0/22, 14.139.60.5". Only IPv4: IPv6 visitors count per /64
 * (see clientIp), which isn't shared. Anything else is ignored, with a warning.
 */
function parseNetworks(list: string): Network[] {
  const out: Network[] = [];
  for (const item of list.split(/[\s,]+/).filter(Boolean)) {
    const [addr, bitsText = "32"] = item.split("/");
    const ip = ipv4(addr);
    const bits = /^\d{1,2}$/.test(bitsText) ? Number(bitsText) : NaN;
    if (ip === null || !(bits >= 0 && bits <= 32)) {
      console.warn(`[rate-limit] RATE_LIMIT_EXEMPT: ignored "${item}" (expected an IPv4 address or range like 103.27.8.0/22)`);
      continue;
    }
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    out.push({ base: (ip & mask) >>> 0, mask });
  }
  return out;
}

function isExempt(ip: string): boolean {
  exempt ??= parseNetworks(process.env.RATE_LIMIT_EXEMPT ?? "");
  const n = exempt.length ? ipv4(ip) : null;
  return n !== null && exempt.some(({ base, mask }) => ((n & mask) >>> 0) === base);
}
